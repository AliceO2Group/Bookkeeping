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
const { TagsFilterDto } = require('./filters/TagsFilterDto.js');
const { CustomJoi } = require('./CustomJoi.js');
const { RunDefinition } = require('../../server/services/run/getRunDefinition.js');
const { RUN_QUALITIES } = require('../enums/RunQualities.js');
const { FromToFilterDto } = require('./filters/FromToFilterDto.js');

const SortDto = Joi.object({
    id: Joi.string()
        .valid('asc', 'desc'),
    text: Joi.string()
        .valid('asc', 'desc'),
});

const DetectorsFilterDto = Joi.object({
    operator: Joi.string().valid('or', 'and', 'none').required(),
    values: Joi.string().trim(),
});

const AmountOperatorComparisonDto = Joi.object({
    operator: Joi.string().valid('<', '<=', '=', '>=', '>'),
    limit: Joi.number().integer().min(0),
});

const FilterDto = Joi.object({
    runNumbers: Joi.string().trim(),
    definitions: CustomJoi.stringArray().items(Joi.string().uppercase().trim().valid(...Object.values(RunDefinition))),
    tags: TagsFilterDto,
    fillNumbers: Joi.string().trim(),
    o2start: FromToFilterDto,
    o2end: FromToFilterDto,
    trgStart: FromToFilterDto,
    trgEnd: FromToFilterDto,
    triggerValues: CustomJoi.stringArray().items(Joi.string().trim().valid('OFF', 'LTU', 'CTP')),
    runDuration: AmountOperatorComparisonDto,
    environmentIds: Joi.string().trim(),
    runQualities: CustomJoi.stringArray().items(Joi.string().trim().valid(...RUN_QUALITIES)),
    nDetectors: AmountOperatorComparisonDto,
    nEpns: AmountOperatorComparisonDto,
    nFlps: AmountOperatorComparisonDto,
    ddflp: Joi.boolean(),
    dcs: Joi.boolean(),
    epn: Joi.boolean(),
    odcTopologyFullName: Joi.string().trim(),
    detectors: DetectorsFilterDto,
    lhcPeriods: Joi.string().trim(),
    runTypes: CustomJoi.stringArray().items(Joi.string()).single().optional(),
});

const QueryDto = Joi.object({
    filter: FilterDto,
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
