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

const QueryDto = Joi.object({
    exportComponent: Joi.string().required(),
    exportRequestData: Joi.object(),
    token: Joi.string(),
    page: PaginationDto,
});

const GetExportDto = Joi.object({
    body: Joi.object({}),
    query: QueryDto.required(),
    params: Joi.object({}),
});

module.exports = GetExportDto;
