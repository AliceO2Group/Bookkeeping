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

const customDateFilterErrorMessages = {
    'date.base': 'Creation date must be a real date and in format YYYY-MM-DD or YYYY/MM/DD',
};

const DateFilterDto = Joi.object({
    from: Joi.date()
        .messages(customDateFilterErrorMessages),
    to: Joi.date()
        .messages(customDateFilterErrorMessages),
});

const SortDto = Joi.object({
    id: Joi.string()
        .valid('asc', 'desc'),
    text: Joi.string()
        .valid('asc', 'desc'),
});

const AmountOperatorComparisonDto = Joi.object({
    operator: Joi.string().valid('<', '<=', '=', '>=', '>'),
    limit: Joi.number().integer().min(0),
});

const FilterDto = Joi.object({
    runNumbers: Joi.string().trim(),
    definitions: CustomJoi.stringArray().items(Joi.string().trim().valid('physics', 'technical', 'cosmic', 'synthetic')),
    tags: TagsFilterDto,
    fillNumbers: Joi.string().trim(),
    o2start: DateFilterDto,
    o2end: DateFilterDto,
    trgStart: DateFilterDto,
    trgEnd: DateFilterDto,
    triggerValues: CustomJoi.stringArray().items(Joi.string().trim().valid('OFF', 'LTU', 'CTP')),
    runDuration: AmountOperatorComparisonDto,
    environmentIds: Joi.string().trim(),
    runQualities: CustomJoi.stringArray().items(Joi.string().trim().valid('good', 'bad', 'test')),
    nDetectors: AmountOperatorComparisonDto,
    nEpns: AmountOperatorComparisonDto,
    nFlps: AmountOperatorComparisonDto,
    ddflp: Joi.boolean(),
    dcs: Joi.boolean(),
    epn: Joi.boolean(),
    odcTopologyFullName: Joi.string().trim(),
    detectors: Joi.string().trim(),
    lhcPeriods: Joi.string().trim(),
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
