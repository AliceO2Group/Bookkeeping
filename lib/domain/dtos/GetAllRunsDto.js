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

const QueryDto = Joi.object({
    filter: RunFilterDto,
    page: PaginationDto,
    sort: DtoFactory.order(['id', 'runNumber', 'text']),
    include: Joi.object({ effectiveQcFlags: Joi.boolean().custom((effectiveQcFlags, helpers) => {
        const [, { filter: { dataPassIds, simulationPassIds, lhcPeriodIds } = {} }] = helpers.state.ancestors;
        const runsCollectionFilters = [dataPassIds, simulationPassIds, lhcPeriodIds].filter(({ length } = {}) => length >= 1);
        if (runsCollectionFilters.length !== 1 || runsCollectionFilters[0].length !== 1) {
            return helpers.message('Including effectiveQcFlags is allowed only when filtering by one and exactly one of: ' +
                    'dataPassIds, simulationPassIds, lhcPeriodIds with exactly one ID.');
        }

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
