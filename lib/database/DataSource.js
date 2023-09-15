/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

const { QueryBuilder } = require('./utilities/QueryBuilder.js');

/**
 * Top level abstraction of the persistence layer
 */
class DataSource {
    /**
     * Constructor
     * @param {Sequelize} sequelize a Sequelize instance
     */
    constructor(sequelize) {
        this._sequelize = sequelize;
    }

    /**
     * Create and return a configured query builder
     *
     * @return {QueryBuilder} a fresh query builder instance
     */
    createQueryBuilder() {
        return new QueryBuilder(this._sequelize);
    }

    /**
     * Execute a given code in an auto-handled transaction. This will handle committing or rolling back the transaction automatically.
     *
     * @param {function} wrapped the function to wrap in a transaction
     * @param {Object} [options] eventual options of the transaction
     * @param {Transaction} [options.transaction] if specified, the wrapped function will be executed in this transaction
     * @returns {Promise} Return of the callback
     */
    transaction(wrapped, options) {
        if (options?.transaction) {
            return Promise.resolve(wrapped(options.transaction));
        }
        return this._sequelize.transaction(options, wrapped);
    }
}

// For now, provide a datasource singleton. Maybe, at some point, there will be DI 🤷
module.exports = { dataSource: new DataSource(require('.').sequelize) };
