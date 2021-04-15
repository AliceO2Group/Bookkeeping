/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

// Default configuration
let host = 'localhost';
let port = 3306;
let username = 'cern';
let password = 'cern';
let database = 'bookkeeping';
let charset = 'utf8mb4';
let collate = 'utf8mb4_unicode_ci';
let timezone = 'Etc/GMT+2';
let logging = false;

if (process.env.DATABASE_LOGGING.toLowerCase() === 'true') {
    logging = true;
}

if (process.env.DATABASE_HOST) {
    host = process.env.DATABASE_HOST;
}

if (process.env.DATABASE_PORT) {
    port = process.env.DATABASE_PORT;
}

if (process.env.DATABASE_USERNAME) {
    username = process.env.DATABASE_USERNAME;
}

if (process.env.DATABASE_PASSWORD) {
    password = process.env.DATABASE_PASSWORD;
}

if (process.env.DATABASE_NAME) {
    database = process.env.DATABASE_NAME;
}

if (process.env.DATABASE_CHARSET) {
    charset = process.env.DATABASE_CHARSET;
}

if (process.env.DATABASE_COLLATE) {
    collate = process.env.DATABASE_COLLATE;
}

if (process.env.DATABASE_TIMEZONE) {
    timezone = process.env.DATABASE_TIMEZONE;
}

if (process.env.NODE_ENV === 'test') {
    database = `${database}_test`;
}

module.exports = {
    dialect: 'mariadb',
    dialectOptions: {
        charset,
        collate,
        timezone,
    },
    host,
    port,
    username,
    password,
    database,
    logging,
    migrationStorageTableName: 'sequelize_meta',
};
