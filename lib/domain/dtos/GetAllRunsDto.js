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
const { DtoFactory } = require('./DtoFactory');
const { singleRunsCollectionCustomCheck } = require('./utils.js');

const QueryDto = Joi.object({
    filter: RunFilterDto,
    page: PaginationDto,
    sort: DtoFactory.order(['id', 'runNumber', 'text']),
    include: Joi.object({ effectiveQcFlags: Joi.boolean().custom((effectiveQcFlags, helpers) => {
        const [, { filter: { dataPassIds, simulationPassIds, lhcPeriodIds } = {} }] = helpers.state.ancestors;

        singleRunsCollectionCustomCheck(
            { dataPassIds, simulationPassIds, lhcPeriodIds },
            helpers,
            'Including effectiveQcFlags is allowed only when ' +
            'the dataPassIds, simulationPassIds and lhcPeriodIds filters collectively contain exactly one ID',
        );

        return effectiveQcFlags;
    }) }),
    token: Joi.string(),
});

const GetAllRunsDto = Joi.object({
    body: Joi.object({}),
    params: Joi.object({}),
    query: QueryDto,
});

module.exports = GetAllRunsDto;
