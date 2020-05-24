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
     * The numbers of items to return.
     *
     * @param {*} expression The include expression.
     * @returns {Object} The current QueryBuilder instance.
     */
    include(expression) {
        if (!this.options.include) {
            this.options.include = [];
        }

        this.options.include.push(expression);
        return this;
    }

    /**
     * The numbers of items to return.
     *
     * @param {Number} number The numbers of items to return.
     * @returns {Object} The current QueryBuilder instance.
     */
    limit(number) {
        this.options.limit = number;
        return this;
    }

    /**
     * The number of items to skip before starting to collect the result set.
     *
     * @param {Number} number  The number of items to skip.
     * @returns {Object} The current QueryBuilder instance.
     */
    offset(number) {
        this.options.offset = number;
        return this;
    }

    /**
     * Set the order of elements.
     *
     * @param {String} column The column to order by.
     * @param {String} direction The direction to order by.
     * @returns {Object} The current QueryBuilder instance.
     */
    orderBy(column, direction) {
        if (!this.options.order) {
            this.options.order = [];
        }

        this.options.order.push([column, direction]);
    }

    /**
     * Generic Key-Value pair setter.
     *
     * @param {*} key The key to set.
     * @param {*} value The value of the key.
     * @returns {Object} The current QueryBuilder instance.
     */
    set(key, value) {
        this.options[key] = value;
        return this;
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
