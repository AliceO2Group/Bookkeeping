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

module.exports = (sequelize) => {
    const { Op } = require('sequelize');

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

            this.notFlag = false;
        }

        /**
         * Sets an exact match filter using the provided value.
         *
         * @param {*} value The required value.
         * @returns {QueryBuilder} The current QueryBuilder instance.
         */
        is(value) {
            let operation;

            if (this.notFlag) {
                operation = { [Op.ne]: value };
            } else {
                operation = { [Op.eq]: value };
            }

            return this._op(operation);
        }

        /**
         * Sets an **AND** match filter using the provided values.
         *
         * @param  {...any} values The required values.
         * @returns {QueryBuilder} The current QueryBuilder instance.
         */
        allOf(...values) {
            let operation;

            if (this.notFlag) {
                operation = { [Op.notIn]: values };
            } else {
                operation = { [Op.and]: values };
            }

            return this._op(operation);
        }

        /**
         * Sets an **OR** match filter using the provided values.
         *
         * @param  {...any} values The required values.
         * @returns {QueryBuilder} The current QueryBuilder instance.
         */
        oneOf(...values) {
            let operation;

            if (this.notFlag) {
                operation = { [Op.notIn]: values };
            } else {
                operation = { [Op.in]: values };
            }

            return this._op(operation);
        }

        /**
         * Sets an range match filter using the provided values, note that this is an **inclusive** filter.
         *
         * @param {*} start The start value.
         * @param {*} end The end value.
         * @returns {QueryBuilder} The current QueryBuilder instance.
         */
        between(start, end) {
            let operation;

            if (this.notFlag) {
                operation = { [Op.notBetween]: [start, end] };
            } else {
                operation = { [Op.between]: [start, end] };
            }

            return this._op(operation);
        }

        /**
         * Sets the **NOT** flag to `true` for the next filter condition.
         *
         * @returns {WhereQueryBuilder} The current WhereQueryBuilder instance.
         */
        not() {
            this.notFlag = true;
            return this;
        }

        /**
         * Sets a starts with filter using the provided value.
         *
         * @param {symbol} value The start value.
         * @returns {QueryBuilder} The current QueryBuilder instance.
         */
        startsWith(value) {
            if (!this.queryBuilder.options.where) {
                this.queryBuilder.options.where = {};
            }

            if (this.notFlag) {
                this.queryBuilder.options.where[this.column] = {
                    [Op.notLike]: `${value}%`,
                };
            } else {
                this.queryBuilder.options.where[this.column] = {
                    [Op.startsWith]: value,
                };
            }

            return this.queryBuilder;
        }

        /**
         * Sets a ends with filter using the provided value.
         *
         * @param {symbol} value The end value.
         * @returns {QueryBuilder} The current QueryBuilder instance.
         */
        endsWith(value) {
            if (!this.queryBuilder.options.where) {
                this.queryBuilder.options.where = {};
            }

            if (this.notFlag) {
                this.queryBuilder.options.where[this.column] = {
                    [Op.notLike]: `%${value}`,
                };
            } else {
                this.queryBuilder.options.where[this.column] = {
                    [Op.endsWith]: value,
                };
            }

            return this.queryBuilder;
        }

        /**
         * Sets a substring filter using the provided value.
         *
         * @param {symbol} value The required value.
         * @returns {QueryBuilder} The current QueryBuilder instance.
         */
        substring(value) {
            if (!this.queryBuilder.options.where) {
                this.queryBuilder.options.where = {};
            }

            if (this.notFlag) {
                this.queryBuilder.options.where[this.column] = {
                    [Op.notLike]: `%${value}%`,
                };
            } else {
                this.queryBuilder.options.where[this.column] = {
                    [Op.substring]: value,
                };
            }

            return this.queryBuilder;
        }

        /**
         * Sets the operation.
         *
         * @param {Object} operation The Sequelize operation to use as where filter.
         * @returns {QueryBuilder} The current QueryBuilder instance.
         */
        _op(operation) {
            if (!this.queryBuilder.options.where) {
                this.queryBuilder.options.where = {};
            }

            this.queryBuilder.options.where[this.column] = operation;

            return this.queryBuilder;
        }
    }

    /**
     * Sequelize implementation of the WhereAssociationQueryBuilder.
     */
    class WhereAssociationQueryBuilder extends WhereQueryBuilder {
        /**
         * Creates a new `WhereQueryBuilder` instance.
         *
         * @param {QueryBuilder} queryBuilder The include expression.
         * @param {String} association The target association.
         * @param {String} column The target column.
         */
        constructor(queryBuilder, association, column) {
            super();

            this.queryBuilder = queryBuilder;
            this.association = association;
            this.column = column;

            this.associationName = this.queryBuilder.model.associations[this.association].toTarget.as;
        }

        /**
         * Sets the operation.
         *
         * @param {Object} operation The Sequelize operation to use as where filter.
         * @returns {QueryBuilder} The current QueryBuilder instance.
         */
        _op(operation) {
            this.queryBuilder.include({
                model: sequelize.models[this.associationName],
                as: this.association,
                required: true,
                through: {
                    where: {
                        [`${this.associationName}_${this.column}`]: operation,
                    },
                },
            });

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
         * @returns {QueryBuilder} The current QueryBuilder instance.
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
         * @returns {QueryBuilder} The current QueryBuilder instance.
         */
        limit(number) {
            this.options.limit = number;
            return this;
        }

        /**
         * The number of items to skip before starting to collect the result set.
         *
         * @param {Number} number  The number of items to skip.
         * @returns {QueryBuilder} The current QueryBuilder instance.
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
         * @param {String} table Optional associated table to perform ordering operation on.
         * @returns {QueryBuilder} The current QueryBuilder instance.
         */
        orderBy(column, direction, table = null) {
            if (!this.options.order) {
                this.options.order = [];
            }

            this.options.order.push(table ? [table, column, direction] : [column, direction]);
            return this;
        }

        /**
         * Generic Key-Value pair setter.
         *
         * @param {*} key The key to set.
         * @param {*} value The value of the key.
         * @returns {QueryBuilder} The current QueryBuilder instance.
         */
        set(key, value) {
            this.options[key] = value;
            return this;
        }

        /**
         * Sets the Sequelize model.
         *
         * @param {*} model The Sequelize model to reference.
         * @returns {QueryBuilder} The current QueryBuilder instance.
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
         * @param {String} association The target association.
         * @param {String} column The target column.
         * @param {*} value The required value.
         * @returns {WhereAssociationQueryBuilder} The current QueryBuilder instance.
         */
        whereAssociation(association, column) {
            return new WhereAssociationQueryBuilder(this, association, column);
        }
    }

    return QueryBuilder;
};
