import "reflect-metadata";
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import { DataSource } from "typeorm";
import 'dotenv/config';
import userRoutes from './routes/user';
import referralRoutes from './routes/referral';
import stateRoutes from './routes/state';
import monsterRoutes from './routes/monster';
import telegramRoutes from './routes/telegram';
import dbConfig from './config/database';
import cors from 'cors';
import mime from "mime";
import { access } from 'fs/promises';
import { Bot, webhookCallback } from "grammy";
import * as zlib from 'zlib';
import { promisify } from 'util';


const app = express();
const port = process.env.PORT || 8000;
export const bot = new Bot(process.env.TELEGRAM_TOKEN || "");

const brotliCompress = promisify(zlib.brotliCompress);
const gzipCompress = promisify(zlib.gzip);

interface ViewCache {
    html: string;
    brotli: Buffer | null;
    gzip: Buffer | null;
}

class ViewPreprocessor {
    private viewCache: Record<string, ViewCache> = {};
    private viewsDirectory: string;

    constructor(viewsDirectory: string) {
        this.viewsDirectory = viewsDirectory;
    }

    private async measureCompression(content: string): Promise<void> {
        const originalSize = Buffer.byteLength(content);

        const brotliCompressed = await brotliCompress(content, {
            params: {
                [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY
            }
        });

        const gzipCompressed = await gzipCompress(content, {
            level: zlib.constants.Z_BEST_COMPRESSION
        });

        const brotliSize = Buffer.byteLength(brotliCompressed);
        const gzipSize = Buffer.byteLength(gzipCompressed);

        console.log(`Compression Metrics:
    Original Size:  ${originalSize} bytes
    Brotli Size:    ${brotliSize} bytes (${((1 - brotliSize / originalSize) * 100).toFixed(2)}% reduction)
    Gzip Size:      ${gzipSize} bytes (${((1 - gzipSize / originalSize) * 100).toFixed(2)}% reduction)`);
    }

    private async compressContent(content: string) {
        try {
            // Compress with Brotli (highest compression)
            const brotliCompressed = await brotliCompress(content, {
                params: {
                    [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
                    [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT
                }
            });

            // Compress with Gzip (fallback)
            // const gzipCompressed = await gzipCompress(content, {
            //     level: zlib.constants.Z_BEST_COMPRESSION
            // });

            return {
                brotli: brotliCompressed,
                gzip: null
            };
        } catch (error) {
            console.error('Compression error:', error);
            return { brotli: null, gzip: null };
        }
    }

    private optimizeSVG(svgContent: string): string {
        return svgContent
            // Remove XML declaration
            .replace(/<\?xml[^>]+\?>/, '')
            // Remove comments
            .replace(/<!--[\s\S]*?-->/g, '')
            // Remove unnecessary whitespace
            .replace(/>\s+</g, '><')
            // Remove unnecessary attributes
            .replace(/\s+(xmlns(:[\w-]+)?=["'][^"']+["'])/g, '')
            // Remove empty attributes
            .replace(/\s+[\w-]+=['"](?:\s*)['"]/g, '')
            // Trim leading and trailing whitespace
            .trim();
    }

    async preprocessViews() {
        const start = performance.now();
        console.log('Starting view preprocessing...');

        try {
            const files = fs.readdirSync(this.viewsDirectory);

            for (const fileName of files) {
                const filePath = path.join(this.viewsDirectory, fileName);

                if (fs.statSync(filePath).isFile() && path.extname(fileName) === '.html') {
                    try {
                        // Read the HTML content
                        let htmlContent = fs.readFileSync(filePath, 'utf8');

                        // Inline and optimize SVGs
                        const imgRegex = /<img\s+([^>]*?)src=["']([^"']+\.svg)["']([^>]*)>/g;
                        let match;

                        while ((match = imgRegex.exec(htmlContent)) !== null) {
                            const fullMatch = match[0];
                            const attributesBeforeSrc = match[1];
                            const svgPath = path.join(process.cwd(), 'public', match[2]);
                            const attributesAfterSrc = match[3];

                            if (fs.existsSync(svgPath)) {
                                // Read and optimize SVG content
                                let svgContent = fs.readFileSync(svgPath, 'utf8');
                                svgContent = this.optimizeSVG(svgContent);

                                // Wrap the inline SVG
                                const wrappedSvg = `
                                <div ${attributesBeforeSrc} ${attributesAfterSrc} style="display: inline-block;">
                                    ${svgContent}
                                </div>`;

                                htmlContent = htmlContent.replace(fullMatch, wrappedSvg);
                            }
                        }

                        // Compress the preprocessed content
                        const compressed = await this.compressContent(htmlContent);
                        // await this.measureCompression(htmlContent);

                        // Store in cache
                        this.viewCache[fileName] = {
                            html: htmlContent,
                            brotli: compressed.brotli,
                            gzip: compressed.gzip
                        };

                        console.log(`Preprocessed and compressed: ${fileName}`);
                    } catch (fileError) {
                        console.error(`Error processing file ${fileName}:`, fileError);
                    }
                }
            }

            console.log(`View preprocessing completed in ${performance.now() - start}ms`);
            console.log(`Total views preprocessed: ${Object.keys(this.viewCache).length}`);
        } catch (error) {
            console.error('Error in view preprocessing:', error);
        }
    }

    getView(fileName: string, encoding?: 'brotli' | 'gzip') {
        const view = this.viewCache[fileName];
        if (!view) return null;

        // If specific encoding is requested and available, return compressed version
        if (encoding === 'brotli' && view.brotli) return view.brotli;
        if (encoding === 'gzip' && view.gzip) return view.gzip;

        // Default to original HTML
        return view.html;
    }
}

const viewPreprocessor = new ViewPreprocessor(path.join(__dirname, '../views'));
viewPreprocessor.preprocessViews();

app.use(bodyParser.json());
process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

export const AppDataSource = new DataSource(dbConfig);

AppDataSource.initialize().then(async () => {
    console.log('Connected to database');
    app.use(cors());
    app.use((req, res, next) => {
        console.log(`${req.method} request for ${req.url}`);
        next();
    });


    // API Routes (should come before static and catch-all routes)
    app.use('/api', userRoutes);
    app.use('/api', referralRoutes);
    app.use('/api', stateRoutes);
    app.use('/api', monsterRoutes);
    app.use('/', telegramRoutes);
    app.get('/dist/:fileName', async (req, res) => {
        const fileName = req.params.fileName;
        const filePath = path.join(__dirname, '../dist', fileName);
        try {
            // Check if file exists
            await access(filePath);

            // Determine the MIME type
            const mimeType = mime.lookup(filePath) || 'application/octet-stream';

            // Set the correct Content-Type
            res.type(mimeType);

            // Send the file
            res.sendFile(filePath);
        } catch (error: unknown) {
            console.error(`Error serving file ${fileName}:`, error);

            if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
                // ENOENT error code means "Error NO ENTry" or "Error NO ENTity", which indicates that the file or directory doesn't exist
                res.status(404).send('File not found');
            } else {
                // For any other error, send a 500 Internal Server Error
                res.status(500).send('Internal Server Error');
            }
        }
    });
    app.get('/views/:fileName', async (req, res) => {
        const start = performance.now();
        console.log(`Start of request`);
        const fileName = req.params.fileName;
        const filePath = path.join(__dirname, '../views', fileName);

        try {
            // Check if the file exists
            await access(filePath);

            const acceptEncoding = req.headers['accept-encoding'] || '';
            let encoding: 'brotli' | 'gzip' | undefined;

            if (acceptEncoding.includes('br')) {
                encoding = 'brotli';
            } else if (acceptEncoding.includes('gzip')) {
                encoding = 'gzip';
            }
            encoding = 'brotli';
            // Determine the MIME type
            const mimeType = mime.lookup(filePath) || 'application/octet-stream';

            if (mimeType === 'text/html') {
                // Read the HTML content
                const content = viewPreprocessor.getView(fileName, encoding);

                if (!content) {
                    return res.status(404).send('View not found');
                }

                // Set appropriate headers
                if (encoding === 'brotli') {
                    res.setHeader('Content-Encoding', 'br');
                } else if (encoding === 'gzip') {
                    res.setHeader('Content-Encoding', 'gzip');
                }

                res.setHeader('Content-Type', 'text/html');
                res.setHeader('Vary', 'Accept-Encoding');

                console.log(`Send of html: ${performance.now() - start}`);
                res.send(content);
            } else {
                // For non-HTML files, send them as-is
                console.log(`Send of not html: ${performance.now() - start}`);
                res.type(mimeType).sendFile(filePath);
            }
            console.log(`End of response: ${performance.now() - start}`);
        } catch (error: unknown) {
            console.error(`Error serving file ${fileName}:`, error);

            if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
                res.status(404).send('File not found');
            } else {
                res.status(500).send('Internal Server Error');
            }
        }
    });

    // Static content routes
    app.use(express.static(path.join(__dirname, '../public')));
    app.use(express.static(path.join(__dirname, '../dist')));

    // Catch-all route (should be last)
    app.get('*', async (req, res) => {
        try {
            const preprocessedContent = viewPreprocessor.getView('index.html');

            if (preprocessedContent) {
                return res.type('text/html').send(preprocessedContent);
            }
        } catch (error) {
            console.error(`Error serving index.html:`, error);

            if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
                res.status(404).send('Index file not found');
            } else {
                res.status(500).send('Internal Server Error');
            }
        }
    });

    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    });

    app.use(process.env.TELEGRAM_WEBHOOK_DOMAIN || "", webhookCallback(bot, 'express'));

    // Start the server
    app.listen(port, async () => {
        await bot.api.setWebhook(`${process.env.TELEGRAM_WEBHOOK_DOMAIN}/telegram`);
        console.log(`Server running at http://localhost:${port}`);
    });

    console.log('App started');
}).catch(error => console.log('TypeORM connection error: ', error));

export default app;