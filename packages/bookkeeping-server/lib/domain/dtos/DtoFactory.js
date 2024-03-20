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

const Joi = require('joi');

const tokenSchema = Joi.object({ token: Joi.string() });

/**
 * Returns a request DTO which require an empty body & params (in-URL parameters) but with a specific list of query parameters
 *
 * @param {object|Joi.Schema} querySchema the description of query parameters (token is added automatically)
 * @return {object} the resulting DTO
 */
const queryOnlyDtoFactory = (querySchema) => Joi.object({
    query: tokenSchema.concat(Joi.isSchema(querySchema) ? querySchema : Joi.object(querySchema)),
    body: Joi.object({}),
    params: Joi.object({}),
});

/**
 * Returns a request DTO which require an empty query & body but with a specific list of params (in-URL parameters)
 *
 * @param {object|Joi.Schema} paramsSchema the description of params
 * @return {object} the resulting DTO
 */
const paramsOnlyDtoFactory = (paramsSchema) => Joi.object({
    query: tokenSchema,
    body: Joi.object({}),
    params: Joi.isSchema(paramsSchema) ? paramsSchema : Joi.object(paramsSchema),
});

/**
 * Schema to describe API result ordering
 * @param {string|string[]} columns list of names of columns by which query results can be ordered
 * @returns {Joi.Schema} schema
 */
const orderDtoFactory = (columns) => {
    const orderSchema = Joi.string().valid('asc', 'desc', 'ASC', 'DESC');
    return Array.isArray(columns)
        ? Joi.object(Object.fromEntries(columns.map((name) => [name, orderSchema])))
        : Joi.object({
            [columns]: orderSchema,
        });
};

exports.DtoFactory = {
    queryOnly: queryOnlyDtoFactory,
    paramsOnly: paramsOnlyDtoFactory,
    order: orderDtoFactory,
};
