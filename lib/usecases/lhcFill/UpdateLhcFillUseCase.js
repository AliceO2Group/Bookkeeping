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
const {
    repositories: {
        LhcFillRepository,
    },
    utilities: {
        QueryBuilder,
        TransactionHelper,
    },
} = require('../../database');
const GetLhcFillUseCase = require('./GetLhcFillUseCase');

/**
 * GetLhcFillUseCase
 */
class UpdateLhcFillUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The GetRunDto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { params, body } = dto;
        const { lhcFillId } = params;
        const { stableBeamsStart, stableBeamsEnd, stableBeamsDuration, beamType, fillingSchemeName } = body;
        const lhcFill = await TransactionHelper.provide(async () => {
            const queryBuilder = new QueryBuilder()
                .where('id').is(lhcFillId);
            const lhcFill = await LhcFillRepository.findOne(queryBuilder);
            if (!lhcFill) {
                return {
                    error: {
                        status: '400',
                        title: `LhcFill with this id (${lhcFillId}) could not be found`,
                    },
                };
            }
            if (stableBeamsStart) {
                lhcFill.stableBeamsStart = stableBeamsStart;
            }
            if (stableBeamsEnd) {
                lhcFill.stableBeamsEnd = stableBeamsEnd;
            }
            if (stableBeamsDuration) {
                lhcFill.stableBeamsDuration = stableBeamsDuration;
            }
            if (beamType) {
                lhcFill.beamType = beamType;
            }
            if (fillingSchemeName) {
                lhcFill.fillingSchemeName = fillingSchemeName;
            }
            await lhcFill.save();
            return lhcFill;
        });
        if (lhcFill.error) {
            return lhcFill;
        }
        const result = await new GetLhcFillUseCase().execute({ params: { lhcFillId } });
        return { result };
    }
}

module.exports = UpdateLhcFillUseCase;
