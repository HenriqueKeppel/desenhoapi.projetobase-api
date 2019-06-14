'use strict';

import * as fs from 'fs-extra-promise';
import * as path from 'path';
import { AutoWired, Singleton } from 'typescript-ioc';
import { inspect } from 'util';
import * as Winston from 'winston';
import { FileTransportOptions } from 'winston/lib/winston/transports';
import { Configurations } from '../command-line';

export enum LogLevel {
    error, warn, info, debug
}
@Singleton
@AutoWired
export class Logger {
    public level: LogLevel;
    public winston: Winston.Logger;

    constructor() {
        this.winston = this.instantiateLogger();
    }

    public isDebugEnabled(): boolean {
        return this.level === LogLevel.debug;
    }

    public isInfoEnabled(): boolean {
        return this.level >= LogLevel.info;
    }

    public isWarnEnabled(): boolean {
        return this.level >= LogLevel.warn;
    }

    public isErrorEnabled(): boolean {
        return this.level >= LogLevel.error;
    }

    public debug(...args: Array<any>) {
        this.winston.debug.apply(this, arguments);
    }

    public info(...args: Array<any>) {
        this.winston.info.apply(this, arguments);
    }

    public warn(...args: Array<any>) {
        this.winston.warn.apply(this, arguments);
    }

    public error(...args: Array<any>) {
        this.winston.error.apply(this, arguments);
    }

    public inspectObject(object: any) {
        inspect(object, { colors: true, depth: 15 });
    }

    private instantiateLogger() {
        this.level = (LogLevel as any)[Configurations.logLevel];

        const logFormatter = Winston.format.printf(info => {
            return `${info.timestamp} ${info.level}: ${info.message} (${info.ms})`;
        });
        const options: Winston.LoggerOptions = {
            format: Winston.format.combine(
                Winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                Winston.format.ms(),
                logFormatter
            ),
            level: LogLevel[this.level],
            transports: [
                new Winston.transports.Console()
            ]
        };
        const logger = Winston.createLogger(options);
        if (Configurations.logDir) {
            const fileName = (process.env.processNumber ?
                `server-${process.env.processNumber}.log` : `server.log`);
            const file: FileTransportOptions = {
                filename: path.join(Configurations.logDir, fileName),
                zippedArchive: true
            };
            fs.ensureDirSync(path.dirname(file.filename));
            logger.add(new Winston.transports.File(file));
        }
        return logger;
    }
}
