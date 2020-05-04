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
let username = 'cern';
let password = 'cern';
let database = 'bookkeeping';

if (process.env.DATABASE_HOST) {
    host = process.env.DATABASE_HOST;
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

if (process.env.NODE_ENV === 'test') {
    database = `${database}_test`;
}

module.exports = {
    dialect: 'mariadb',
    host,
    username,
    password,
    database,
};
