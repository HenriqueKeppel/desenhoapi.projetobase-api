#!/usr/bin/env node
'use strict';

import chalk from 'chalk';
import * as cluster from 'cluster';
import * as os from 'os';
import { Container } from 'typescript-ioc';
import { Configurations, Parameters } from './infrastructure/command-line';
import { Logger } from './infrastructure/logger/logger';
import { Config, Server } from './infrastructure/server';

const logger = Container.get(Logger);

class Application {
    public start(instances: number) {
        if (instances === 1) {
            this.standalone();
        } else {
            this.cluster(instances);
        }
    }

    public standalone() {
        this.runServer()
            .catch((err: Error) => {
                logger.error(chalk.red(`Error starting server: ${err.message}`));
                process.exit(-1);
            });
    }

    public cluster(instances: number) {
        if (cluster.isMaster) {
            const n = instances < 1 ? os.cpus().length : instances;
            logger.info(`Starting child processes...`);

            for (let i = 0; i < n; i++) {
                const env = { processNumber: i + 1 };
                const worker = cluster.fork(env);
                (worker as any).process['env'] = env;
            }

            cluster.on('online', function (worker) {
                logger.info(`Child process running PID: ${worker.process.pid} PROCESS_NUMBER: ${(worker as any).process['env'].processNumber}`);
            });

            cluster.on('exit', function (worker, code, signal) {
                logger.info(`PID ${worker.process.pid}  code: ${code}  signal: ${signal}`);
                const env = (worker as any).process['env'];
                const newWorker = cluster.fork(env);
                (newWorker as any).process['env'] = env;
            });
        } else {
            this.runServer()
                .catch((err: Error) => {
                    logger.error(chalk.red(`Error starting gateway: ${err.message}`));
                    process.exit(-1);
                });
        }

        process.on('uncaughtException', function (err: any) {
            logger.error(err);
        });
    }

    private async runServer() {
        const server: Server = new Server(Configurations.server as Config);
        if (server.running) {
            return;
        }
        async function graceful() {
            await server.stop();
            process.exit(0);
        }

        // Stop graceful
        process.on('SIGTERM', graceful);
        process.on('SIGINT', graceful);

        await server.start();
    }
}

const app = new Application();

app.start(Parameters.instances);
