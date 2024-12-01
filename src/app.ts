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


const app = express();
const port = process.env.PORT || 8000;
export const bot = new Bot(process.env.TELEGRAM_TOKEN || "");

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
        const fileName = req.params.fileName;
        const filePath = path.join(__dirname, '../views', fileName);

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

    // Static content routes
    app.use(express.static(path.join(__dirname, '../public')));
    app.use(express.static(path.join(__dirname, '../dist')));

    // HTML file routes
    const viewsDir = path.join(__dirname, '../views');
    const htmlFiles = fs.readdirSync(viewsDir).filter((file: string) => file.endsWith('.html'));
    htmlFiles.forEach((file: string) => {
        console.log(`/${path.parse(file).name}`);
        app.get(`/${path.parse(file).name}`, (req, res) => {
            res.sendFile(path.join(viewsDir, file));
        });
    });

    // Catch-all route (should be last)
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../views', 'index.html'));
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