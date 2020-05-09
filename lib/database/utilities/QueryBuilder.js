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

/**
 * Sequelize implementation of the QueryBuilder.
 */
class QueryBuilder {
    /**
     * Creates a new `QueryBuilder` instance.
     */
    constructor() {
        this.options = {};
    }

    /**
     * Returns the implementation specific query.
     *
     * @returns {Object} Implementation specific query.
     */
    toImplementation() {
        return this.options;
    }

    /**
     * Adds a filter on the given column value pair.
     *
     * @param {*} column The target column.
     * @param {*} value The required value.
     * @returns {Object} The current QueryBuilder instance.
     */
    where(column, value) {
        if (!this.options.where) {
            this.options.where = {};
        }

        this.options.where[column] = value;
        return this;
    }
}

module.exports = QueryBuilder;
