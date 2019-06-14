'use strict';
import { Application } from 'express';
import * as morgan from 'morgan';
import { Configurations } from '../command-line';

export class AccessLogger {
    public static configureAccessLoger(app: Application) {
        app.use(morgan('[:date[clf]] HTTP :method - :status - :url (:response-time ms)'));
        if (Configurations.logDir) {
            const rotationStream = require('rotating-file-stream');
            const fileName = (process.env.processNumber ?
                `access-${process.env.processNumber}.log` : `access.log`);
            const accessLogStream = rotationStream(fileName, {
                interval: '1d', // rotate daily
                path: Configurations.logDir
            });

            app.use(morgan('combined', { stream: accessLogStream }));
        }
    }
}