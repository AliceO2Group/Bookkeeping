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

/**
 * Separate filter DTO for get all environments, because EnvironmentsFilterDto
 * is used for logs and requires different information
 */
const FilterDto = Joi.object({
    ids: Joi.string().trim().optional(),
    statusHistory: Joi.string().trim().optional(),
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
