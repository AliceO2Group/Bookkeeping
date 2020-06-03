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

module.exports = (sequelize, Sequelize) => {
    const { Op } = Sequelize;

    /**
     * Sequelize implementation of the WhereQueryBuilder.
     */
    class WhereQueryBuilder {
        /**
         * Creates a new `WhereQueryBuilder` instance.
         *
         * @param {QueryBuilder} queryBuilder The include expression.
         * @param {String} column The target column.
         */
        constructor(queryBuilder, column) {
            this.queryBuilder = queryBuilder;
            this.column = column;
        }

        /**
         * Sets an exact match filter using the provided value.
         *
         * @param {*} value The required value.
         * @returns {QueryBuilder} The current QueryBuilder instance.
         */
        is(value) {
            if (!this.queryBuilder.options.where) {
                this.queryBuilder.options.where = {};
            }

            this.queryBuilder.options.where[this.column] = value;
            return this.queryBuilder;
        }

        /**
         * Sets an **AND** match filter using the provided values.
         *
         * @param  {...any} values The required values.
         * @returns {QueryBuilder} The current QueryBuilder instance.
         */
        allOf(...values) {
            if (!this.queryBuilder.options.where) {
                this.queryBuilder.options.where = {};
            }

            this.queryBuilder.options.where[this.column] = {
                [Op.and]: values,
            };

            return this.queryBuilder;
        }

        /**
         * Sets an **OR** match filter using the provided values.
         *
         * @param  {...any} values The required values.
         * @returns {QueryBuilder} The current QueryBuilder instance.
         */
        oneOf(...values) {
            if (!this.queryBuilder.options.where) {
                this.queryBuilder.options.where = {};
            }

            this.queryBuilder.options.where[this.column] = {
                [Op.in]: values,
            };

            return this.queryBuilder;
        }
    }

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
            return this;
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
         * Sets the Sequelize model.
         *
         * @param {*} model The Sequelize model to reference.
         * @returns {Object} The current QueryBuilder instance.
         */
        setModel(model) {
            this.model = model;
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
         * Adds a filter on the given column.
         *
         * @param {String} column The target column.
         * @returns {WhereQueryBuilder} The WhereQueryBuilder instance.
         */
        where(column) {
            return new WhereQueryBuilder(this, column);
        }

        /**
         * Adds a filter on the given association with a column value pair.
         *
         * @param {*} association The target association.
         * @param {*} column The target column.
         * @param {*} value The required value.
         * @returns {Object} The current QueryBuilder instance.
         */
        whereAssociation(association, column, value) {
            const associationName = this.model.associations[association].toTarget.as;

            this.include({
                model: sequelize.models[associationName],
                as: association,
                required: true,
                through: { where: { [`${associationName}_${column}`]: value } },
            });

            return this;
        }
    }

    return QueryBuilder;
};
