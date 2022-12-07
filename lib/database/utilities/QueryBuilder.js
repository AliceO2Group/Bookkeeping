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

const { Op } = require('sequelize');

module.exports = (sequelize) => {
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
                operation = { [value === null ? Op.not : Op.ne]: value };
            } else {
                operation = { [value === null ? Op.is : Op.eq]: value };
            }

            return this._op(operation);
        }

        /**
         * Sets an exact match filter using:
         * * the provided value
         * or
         * * if value is null
         *
         * @param {*} value The required value.
         * @returns {QueryBuilder} The current QueryBuilder instance.
         */
        isOrNull(value) {
            let operation;

            if (this.notFlag) {
                operation = { [Op.or]: { [Op.is]: null, [Op.ne]: value } };
            } else {
                operation = { [Op.or]: { [Op.is]: null, [Op.eq]: value } };
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
         * Set a max range limit using the provided value
         *
         * @param {*} max the upper limit criteria
         * @param {boolean} strict if true, the comparison is exclusive, else it will be inclusive (equality match)
         *
         * @return {void}
         */
        lowerThan(max, strict) {
            if (this.notFlag) {
                this.notFlag = !this.notFlag;
                this.greaterThan(max, !strict);
                this.notFlag = !this.notFlag;
            } else {
                if (strict) {
                    this._op({ [Op.lt]: max });
                } else {
                    this._op({ [Op.lte]: max });
                }
            }
        }

        /**
         * Set a min range limit using the provided value
         *
         * @param {*} min the lower limit criteria
         * @param {boolean} strict if true, the comparison is exclusive, else it will be inclusive (equality match)
         *
         * @return {void}
         */
        greaterThan(min, strict) {
            if (this.notFlag) {
                this.notFlag = !this.notFlag;
                this.lowerThan(min, !strict);
                this.notFlag = !this.notFlag;
            } else {
                if (strict) {
                    this._op({ [Op.gt]: min });
                } else {
                    this._op({ [Op.gte]: min });
                }
            }
        }

        /**
         * Set the next filter condition according to a comparison operator ("<", "<=", ">=", ">")
         *
         * @param {"<"|"<="|"="|">="|">"} operator the operator to apply
         * @param {*} limit the limit to compare to
         *
         * @return {void}
         */
        applyOperator(operator, limit) {
            switch (operator) {
                case '<':
                    this.lowerThan(limit, true);
                    break;
                case '<=':
                    this.lowerThan(limit, false);
                    break;
                case '=':
                    this.is(limit);
                    break;
                case '>=':
                    this.greaterThan(limit, false);
                    break;
                case '>':
                    this.greaterThan(limit, true);
                    break;
                default:
                    throw new Error(`Unhandled operator: ${operator}`);
            }
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
            let condition;

            if (this.notFlag) {
                condition = {
                    [Op.notLike]: `${value}%`,
                };
            } else {
                condition = {
                    [Op.startsWith]: value,
                };
            }

            return this._op(condition);
        }

        /**
         * Sets a ends with filter using the provided value.
         *
         * @param {symbol} value The end value.
         * @returns {QueryBuilder} The current QueryBuilder instance.
         */
        endsWith(value) {
            let condition;

            if (this.notFlag) {
                condition = {
                    [Op.notLike]: `%${value}`,
                };
            } else {
                condition = {
                    [Op.endsWith]: value,
                };
            }

            return this._op(condition);
        }

        /**
         * Sets a substring filter using the provided value.
         *
         * @param {string} value The required value.
         * @returns {QueryBuilder} The current QueryBuilder instance.
         */
        substring(value) {
            let condition;

            if (this.notFlag) {
                condition = {
                    [Op.notLike]: `%${value}%`,
                };
            } else {
                condition = {
                    [Op.substring]: value,
                };
            }

            return this._op(condition);
        }

        /**
         * Set a substring filter (or) on all the given values
         *
         * @param {string[]} values The required value.
         * @returns {QueryBuilder} The current QueryBuilder instance.
         */
        oneOfSubstrings(values) {
            let condition;

            if (!this.notFlag) {
                condition = {
                    [Op.or]: values.map((value) => ({
                        [Op.substring]: `%${value}%`,
                    })),
                };
            } else {
                condition = {
                    [Op.and]: values.map((value) => ({
                        [Op.not]: {
                            [Op.substring]: `%${value}%`,
                        },
                    })),
                };
            }

            return this._op(condition);
        }

        /**
         * Set a substring filter (and) on all the given values
         *
         * @param {string[]} values The required value.
         * @returns {QueryBuilder} The current QueryBuilder instance.
         */
        allOfSubstrings(values) {
            let condition;

            if (!this.notFlag) {
                condition = {
                    [Op.and]: values.map((value) => ({
                        [Op.substring]: `%${value}%`,
                    })),
                };
            } else {
                condition = {
                    [Op.or]: values.map((value) => ({
                        [Op.not]: {
                            [Op.substring]: `%${value}%`,
                        },
                    })),
                };
            }

            return this._op(condition);
        }

        /**
         * Sets the operation.
         *
         * @param {Object} operation The Sequelize operation to use as where filter.
         * @returns {QueryBuilder} The current QueryBuilder instance.
         */
        _op(operation) {
            this.queryBuilder.andWhere(this.column, operation);

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
            this.options = { where: {}, replacements: {} };
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
            if (typeof column === 'function') {
                column = column(sequelize);
            }

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
         * Adds a filter on the given subject.
         *
         * @param {string|Object} subject The target subject.
         * @returns {WhereQueryBuilder} The WhereQueryBuilder instance.
         */
        where(subject) {
            return new WhereQueryBuilder(this, subject);
        }

        /**
         * Add a condition to the currently building where clauses using AND operation
         *
         * @param {string|function|Object} subject the subject on which where condition must be applied or the full criteria expression
         * @param {Object|undefined} [criteria] the criteria of the where condition. If undefined, the subject is expected to contain the full
         *     criteria
         *
         * @return {QueryBuilder} fluent interface
         */
        andWhere(subject, criteria) {
            if (!this.options.where[Op.and]) {
                this.options.where[Op.and] = [];
            }

            if (typeof subject === 'function') {
                subject = subject(sequelize);
            }

            let fullCriteria;
            if (criteria === undefined) {
                fullCriteria = subject;
            } else if (typeof subject === 'string') {
                fullCriteria = { [subject]: criteria };
            } else {
                fullCriteria = sequelize.where(subject, criteria);
            }
            this.options.where[Op.and].push(fullCriteria);

            return this;
        }

        /**
         * Add a litteral expression to the current where condition ("AND")
         *
         * @param {string} expression the literal where condition
         * @param {Object} replacements the replacement text for the literal (global to all the query builder). Placeholders in literal
         *     (prefixed by ":") will be replaced by the value at the corresponding key
         * @return {QueryBuilder} fluent interface
         */
        literalWhere(expression, replacements) {
            if (!this.options.where[Op.and]) {
                this.options.where[Op.and] = [];
            }

            this.options.where[Op.and].push(sequelize.literal(expression));
            for (const key in replacements) {
                this.options.replacements[key] = replacements[key];
            }
            return this;
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
