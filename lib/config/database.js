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
const host = process.env?.DATABASE_HOST || 'localhost';
const port = process.env?.DATABASE_PORT || 3306;
const username = process.env?.DATABASE_USERNAME || 'cern';
const password = process.env?.DATABASE_PASSWORD || 'cern';
const database = `${process.env?.DATABASE_NAME || 'bookkeeping'}${process.env?.NODE_ENV === 'test' ? '_test' : ''}`;
const charset = process.env?.DATABASE_CHARSET || 'utf8mb4';
const collate = process.env?.DATABASE_COLLATE || 'utf8mb4_unicode_ci';
const timezone = process.env?.DATABASE_TIMEZONE || 'Etc/GMT+2';
const logging = process.env?.DATABASE_LOGGING?.toLowerCase() === 'true';

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
