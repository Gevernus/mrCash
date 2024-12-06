"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = exports.bot = void 0;
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const typeorm_1 = require("typeorm");
require("dotenv/config");
const user_1 = __importDefault(require("./routes/user"));
const referral_1 = __importDefault(require("./routes/referral"));
const state_1 = __importDefault(require("./routes/state"));
const monster_1 = __importDefault(require("./routes/monster"));
const telegram_1 = __importDefault(require("./routes/telegram"));
const database_1 = __importDefault(require("./config/database"));
const cors_1 = __importDefault(require("cors"));
const mime_1 = __importDefault(require("mime"));
const promises_1 = require("fs/promises");
const grammy_1 = require("grammy");
const zlib = __importStar(require("zlib"));
const util_1 = require("util");
const app = (0, express_1.default)();
const port = process.env.PORT || 8000;
exports.bot = new grammy_1.Bot(process.env.TELEGRAM_TOKEN || "");
const brotliCompress = (0, util_1.promisify)(zlib.brotliCompress);
const gzipCompress = (0, util_1.promisify)(zlib.gzip);
class ViewPreprocessor {
    constructor(viewsDirectory) {
        this.viewCache = {};
        this.viewsDirectory = viewsDirectory;
    }
    async measureCompression(content) {
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
    async compressContent(content) {
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
        }
        catch (error) {
            console.error('Compression error:', error);
            return { brotli: null, gzip: null };
        }
    }
    optimizeSVG(svgContent) {
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
            const files = fs_1.default.readdirSync(this.viewsDirectory);
            for (const fileName of files) {
                const filePath = path_1.default.join(this.viewsDirectory, fileName);
                if (fs_1.default.statSync(filePath).isFile() && path_1.default.extname(fileName) === '.html') {
                    try {
                        // Read the HTML content
                        let htmlContent = fs_1.default.readFileSync(filePath, 'utf8');
                        // Inline and optimize SVGs
                        const imgRegex = /<img\s+([^>]*?)src=["']([^"']+\.svg)["']([^>]*)>/g;
                        let match;
                        while ((match = imgRegex.exec(htmlContent)) !== null) {
                            const fullMatch = match[0];
                            const attributesBeforeSrc = match[1];
                            const svgPath = path_1.default.join(process.cwd(), 'public', match[2]);
                            const attributesAfterSrc = match[3];
                            if (fs_1.default.existsSync(svgPath)) {
                                // Read and optimize SVG content
                                let svgContent = fs_1.default.readFileSync(svgPath, 'utf8');
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
                    }
                    catch (fileError) {
                        console.error(`Error processing file ${fileName}:`, fileError);
                    }
                }
            }
            console.log(`View preprocessing completed in ${performance.now() - start}ms`);
            console.log(`Total views preprocessed: ${Object.keys(this.viewCache).length}`);
        }
        catch (error) {
            console.error('Error in view preprocessing:', error);
        }
    }
    getView(fileName, encoding) {
        const view = this.viewCache[fileName];
        if (!view)
            return null;
        // If specific encoding is requested and available, return compressed version
        if (encoding === 'brotli' && view.brotli)
            return view.brotli;
        if (encoding === 'gzip' && view.gzip)
            return view.gzip;
        // Default to original HTML
        return view.html;
    }
}
const viewPreprocessor = new ViewPreprocessor(path_1.default.join(__dirname, '../views'));
viewPreprocessor.preprocessViews();
app.use(body_parser_1.default.json());
process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error', err);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
exports.AppDataSource = new typeorm_1.DataSource(database_1.default);
exports.AppDataSource.initialize().then(async () => {
    console.log('Connected to database');
    app.use((0, cors_1.default)());
    app.use((req, res, next) => {
        console.log(`${req.method} request for ${req.url}`);
        next();
    });
    // API Routes (should come before static and catch-all routes)
    app.use('/api', user_1.default);
    app.use('/api', referral_1.default);
    app.use('/api', state_1.default);
    app.use('/api', monster_1.default);
    app.use('/', telegram_1.default);
    app.get('/dist/:fileName', async (req, res) => {
        const fileName = req.params.fileName;
        const filePath = path_1.default.join(__dirname, '../dist', fileName);
        try {
            // Check if file exists
            await (0, promises_1.access)(filePath);
            // Determine the MIME type
            const mimeType = mime_1.default.lookup(filePath) || 'application/octet-stream';
            // Set the correct Content-Type
            res.type(mimeType);
            // Send the file
            res.sendFile(filePath);
        }
        catch (error) {
            console.error(`Error serving file ${fileName}:`, error);
            if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
                // ENOENT error code means "Error NO ENTry" or "Error NO ENTity", which indicates that the file or directory doesn't exist
                res.status(404).send('File not found');
            }
            else {
                // For any other error, send a 500 Internal Server Error
                res.status(500).send('Internal Server Error');
            }
        }
    });
    app.get('/views/:fileName', async (req, res) => {
        const start = performance.now();
        console.log(`Start of request`);
        const fileName = req.params.fileName;
        const filePath = path_1.default.join(__dirname, '../views', fileName);
        try {
            // Check if the file exists
            await (0, promises_1.access)(filePath);
            const acceptEncoding = req.headers['accept-encoding'] || '';
            let encoding;
            if (acceptEncoding.includes('br')) {
                encoding = 'brotli';
            }
            else if (acceptEncoding.includes('gzip')) {
                encoding = 'gzip';
            }
            encoding = 'brotli';
            // Determine the MIME type
            const mimeType = mime_1.default.lookup(filePath) || 'application/octet-stream';
            if (mimeType === 'text/html') {
                // Read the HTML content
                const content = viewPreprocessor.getView(fileName, encoding);
                if (!content) {
                    return res.status(404).send('View not found');
                }
                // Set appropriate headers
                if (encoding === 'brotli') {
                    res.setHeader('Content-Encoding', 'br');
                }
                else if (encoding === 'gzip') {
                    res.setHeader('Content-Encoding', 'gzip');
                }
                res.setHeader('Content-Type', 'text/html');
                res.setHeader('Vary', 'Accept-Encoding');
                console.log(`Send of html: ${performance.now() - start}`);
                res.send(content);
            }
            else {
                // For non-HTML files, send them as-is
                console.log(`Send of not html: ${performance.now() - start}`);
                res.type(mimeType).sendFile(filePath);
            }
            console.log(`End of response: ${performance.now() - start}`);
        }
        catch (error) {
            console.error(`Error serving file ${fileName}:`, error);
            if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
                res.status(404).send('File not found');
            }
            else {
                res.status(500).send('Internal Server Error');
            }
        }
    });
    // Static content routes
    app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
    app.use(express_1.default.static(path_1.default.join(__dirname, '../dist')));
    // Catch-all route (should be last)
    app.get('*', async (req, res) => {
        try {
            const preprocessedContent = viewPreprocessor.getView('index.html');
            if (preprocessedContent) {
                return res.type('text/html').send(preprocessedContent);
            }
        }
        catch (error) {
            console.error(`Error serving index.html:`, error);
            if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
                res.status(404).send('Index file not found');
            }
            else {
                res.status(500).send('Internal Server Error');
            }
        }
    });
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    });
    app.use(process.env.TELEGRAM_WEBHOOK_DOMAIN || "", (0, grammy_1.webhookCallback)(exports.bot, 'express'));
    // Start the server
    app.listen(port, async () => {
        await exports.bot.api.setWebhook(`${process.env.TELEGRAM_WEBHOOK_DOMAIN}/telegram`);
        console.log(`Server running at http://localhost:${port}`);
    });
    console.log('App started');
}).catch(error => console.log('TypeORM connection error: ', error));
exports.default = app;
//# sourceMappingURL=app.js.map