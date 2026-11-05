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

const { sequelize } = require('../../../database');
const { cacheAsyncFunction } = require('../../../utilities/cacheAsyncFunction.js');

/**
 * Query the database for the distinct top-level keys of the environments' raw configurations
 *
 * @return {Promise<string[]>} the configuration keys
 */
const fetchConfigurationKeys = async () => {
    const [rows] = await sequelize.query(`
        SELECT DISTINCT JSON_KEYS(raw_configuration) AS \`keys\`
        FROM environments
        WHERE JSON_VALID(raw_configuration)
    `);

    const keys = new Set();
    for (const { keys: serializedKeys } of rows) {
        for (const key of JSON.parse(serializedKeys) ?? []) {
            keys.add(key);
        }
    }

    return [...keys];
};

/**
 * Returns the distinct top-level keys of the environments raw configuration
 *
 * The database is queried only once and then the same result is returned until server restart.
 * If the query fails, the next call retries it.
 *
 * @return {Promise<string[]>} the configuration keys
 */
exports.getEnvironmentsConfigurationKeys = cacheAsyncFunction(fetchConfigurationKeys, { cacheRejections: false });
