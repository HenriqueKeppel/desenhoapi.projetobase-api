'use strict';

import * as compression from 'compression';
import * as express from 'express';
import * as http from 'http';
import * as _ from 'lodash';
import * as path from 'path';
import { Inject } from 'typescript-ioc';
import { Server as RestServer } from 'typescript-rest';
import { AccessLogger } from './logger/express-logger';
import { Logger } from './logger/logger';

export interface Config {
    listenPort: number;
    disableCompression?: boolean;
    underProxy?: boolean;
}

export class Server {
    private app: express.Application;
    private serverRunning: boolean;
    private httpServer: http.Server;
    private config: Config;
    @Inject
    private logger: Logger;

    constructor(config: Config) {
        this.config = config;
    }

    get running(): boolean {
        return this.serverRunning;
    }

    public async start() {
        this.app = express();
        await this.configureServer();
        this.httpServer = http.createServer(this.app);

        await Promise.resolve(new Promise((resolve, reject) => {
            this.httpServer.listen(_.toSafeInteger(this.config.listenPort), () => {
                this.logger.info(`Server listenning HTTP on port ${this.config.listenPort}`);
                this.serverRunning = true;
                resolve();
            });
        }));
    }

    public stop(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!this.serverRunning) {
                return resolve();
            }
            this.httpServer.close(() => {
                this.logger.info('Server stopped');
                this.serverRunning = false;
                this.httpServer = null;
                resolve();
            });
        });
    }

    private async configureServer(): Promise<void> {
        this.app.disable('x-powered-by');
        if (!this.config.disableCompression) {
            this.app.use(compression());
        }
        if (this.config.underProxy) {
            this.app.enable('trust proxy');
        }
        AccessLogger.configureAccessLoger(this.app);
        this.configureHealthcheck();
        this.configureApiDocs();
        RestServer.loadServices(this.app, '../interfaces/*.js', __dirname);
    }

    private configureHealthcheck() {
        this.app.get('/healthcheck', (req: express.Request, res: express.Response) => {
            res.write('OK');
            res.end();
        });
    }

    private configureApiDocs() {
        const schemes = ['http'];
        const swaggerFile =
            path.join(__dirname, '../swagger.json');

        const apiPath = 'api-docs';
        const apiHost = `localhost:${this.config.listenPort}`;
        RestServer.swagger(this.app, swaggerFile, apiPath, apiHost, schemes);
    }
}
