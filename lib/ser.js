/* eslint-disable require-jsdoc */
import { HttpServer } from '@aliceo2/web-ui/Frontend/js/src/index.js';
// import { JwtConfig } from './config';
import path from 'path';
// import { webUiServer } from './server';

const secret = process.env?.JWT_SECRET || null;
const expiration = process.env?.JWT_EXPIRATION || '1y';
const issuer = process.env?.JWT_ISSUER || 'o2-ui';
const maxAge = process.env?.JWT_MAX_AGE || '1y';

const JwtConfig = {
    secret,
    expiration,
    issuer,
    maxAge,
};

class WebUiServer {
    constructor() {
        this.http = new HttpServer({
            port: 5173,
            autoListen: false,
        }, JwtConfig);

        this.http.addStaticPath(path.resolve('lib', 'public'));
    }

    async close() {
        this.logger.info('Stopping...');

        try {
            await this.http.close();
        } catch (error) {
            this.logger.error(`Error while stopping: ${error}`);
            return Promise.reject(error);
        }

        this.logger.info('Stopped');
    }

    async listen() {
        this.logger.info('Starting...');

        try {
            await this.http.listen();
        } catch (error) {
            this.logger.error(`Error while starting: ${error}`);
            return Promise.reject(error);
        }

        this.logger.info('Started');
    }
}

// const server = webUiServer;
const server = new WebUiServer();
const { app } = server.http;

export const viteNodeApp = app;
