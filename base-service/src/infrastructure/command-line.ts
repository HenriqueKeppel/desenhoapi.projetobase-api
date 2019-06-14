'use strict';

import { ArgumentParser } from 'argparse';
import * as fs from 'fs-extra-promise';
import * as _ from 'lodash';
import * as path from 'path';

const packageJson = require('../../package.json');

const parser = new ArgumentParser({
    addHelp: true,
    description: 'Offers service',
    version: packageJson.version
});

parser.addArgument(
    ['-i', '--instances'],
    {
        defaultValue: 1,
        help: 'The number of instances to start (0 = all cpus cores)',
        type: 'int'
    }
);

parser.addArgument(
    ['-c', '--config'],
    {
        defaultValue: './server-config.json',
        help: 'The server configurations file',
        type: 'string'
    }
);

export const Parameters = parser.parseArgs();
export const Configurations = fs.readJsonSync(Parameters.config);

if (Configurations.logDir && _.startsWith(Configurations.logDir, '.')) {
    Configurations.logDir = path.join(process.cwd(), Configurations.logDir);
}