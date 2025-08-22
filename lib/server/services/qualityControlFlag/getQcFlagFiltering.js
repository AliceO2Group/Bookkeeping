const { Op } = require('sequelize');

/**
 * @typedef CreatedByFilter
 * @property {string} names
 * @property {'or'|'none'} operator
 */

/**
 * @typedef QcFlagFilter
 * @property {CreatedByFilter} createdBy
 */

/**
 * Get sequelize clause for CreateByFilter
 *
 * @param {QcFlagFilter} filter filter
 * @returns {object} sequelize clause
 * @throws {Error} if bad operator provided
 */
const getCreatedByFilterClause = (filter = {}) => {
    const { createdBy: { names: createdByNames, operator: createdByOperator } = {} } = filter;

    if (createdByNames && createdByOperator) {
        if (createdByOperator === 'or') {
            return { name: { [Op.or]: createdByNames } };
        } else if (createdByOperator === 'none') {
            return { [Op.not]: { name: { [Op.or]: createdByNames } } };
        } else {
            throw Error(`Operator ${createdByOperator} is not suppoerted`);
        }
    }
};

module.exports.getCreatedByFilterClause = getCreatedByFilterClause;
