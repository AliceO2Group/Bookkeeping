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
const PaginationDto = require('./PaginationDto');
const { FromToFilterDto } = require('./filters/FromToFilterDto');
const { validateRange, RANGE_INVALID } = require('../../utilities/rangeUtils.js');

/**
 * Separate filter DTO for get all environments, because EnvironmentsFilterDto
 * is used for logs and requires different information
 */
const FilterDto = Joi.object({
    ids: Joi.string().trim().optional(),
    currentStatus: Joi.string().trim().optional(),
    statusHistory: Joi.string().trim().optional(),
    runNumbers: Joi.string().trim().custom(validateRange).messages({
        [RANGE_INVALID]: '{{#message}}',
        'string.base': 'Run numbers must be comma-separated numbers or ranges (e.g. 12,15-18)',
    }).optional(),
    created: FromToFilterDto,
    rawConfiguration: Joi.object({
        // Surrounding quotes are allowed for better UX, but are not part of the key
        key: Joi.string().trim().max(256).replace(/^"(.*)"$/, '$1').optional(),

        /*
         * Strip surrounding quotes and unescape JSON escapes (e.g. [\"flp1\"] copied from the raw JSON becomes ["flp1"]), the use case
         * then compares it to the unescaped value of the key, or to both forms when searching the whole configuration
         */
        value: Joi.string().trim().max(1000).replace(/^"(.*)"$/, '$1').replace(/\\(["\\])/g, '$1').optional(),
    }).or('key', 'value').optional(),
});

const QueryDto = Joi.object({
    filter: FilterDto,
    page: PaginationDto,
    token: Joi.string(),
});

const GetAllEnvironmentsDto = Joi.object({
    body: Joi.object({}),
    params: Joi.object({}),
    query: QueryDto,
});

module.exports = GetAllEnvironmentsDto;
