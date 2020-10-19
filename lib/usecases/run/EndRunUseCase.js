const { GetRunUseCase } = require('.');
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
        RunRepository,
    },
    utilities: {
        TransactionHelper,
        QueryBuilder
    },
} = require('../../database');

const {
    adapters: {
        RunAdapter,
    },
} = require('../../domain');

/**
 * EndRunUseCase
 */
class EndRunUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The EndRunDto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const {body, params} = dto;
        const {runId} = params;
        const {O2EndTime, TrgEndTime, runQuality} = body;

        return await TransactionHelper.provide(async () => {
            body.userId = dto.session.id || null;
            
            const queryBuilder = new QueryBuilder().where('runNumber').is(runId);

            let runEntity = await RunRepository.findOne(queryBuilder);

            if (runEntity) {
                runEntity.timeO2End = O2EndTime;
                runEntity.timeTrgEnd = TrgEndTime;
                runEntity.runQuality = runQuality;
                await runEntity.save();
            }else{
                return {
                    error: {
                        status: '400',
                        title: `run with this runNumber (${runId}) could not be found`,
                    },
                };
            }

            return RunAdapter.toEntity(runEntity);
        });
    }
}

module.exports = EndRunUseCase;
