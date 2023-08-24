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
const { RunFilterDto } = require('./filters/RunFilterDto.js');

const SortDto = Joi.object({
    id: Joi.string()
        .valid('asc', 'desc'),
    text: Joi.string()
        .valid('asc', 'desc'),
});

const QueryDto = Joi.object({
    filter: RunFilterDto,
    page: PaginationDto,
    sort: SortDto,
    token: Joi.string(),
});

const GetAllRunsDto = Joi.object({
    body: Joi.object({}),
    params: Joi.object({}),
    query: QueryDto,
});

module.exports = GetAllRunsDto;
