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
        QueryBuilder,
    },
} = require('../../database');
const { GetLhcFillUseCase } = require('../lhcFill');
const GetRunUseCase = require('./GetRunUseCase');

/**
 * Update a run with provided values. For now we update only RunQuality
 */
class UpdateRunUseCase {
    /**
     * Executes this use case.
     *
     * @param {UpdateRunDto} dto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { body, params, query } = dto;
        const runId = params ? params.runId : null;
        const runNumber = query ? query.runNumber : null;
        const { runQuality, envId, lhcBeamEnergy, lhcBeamMode, lhcBetaStar, aliceL3Current, aliceDipoleCurrent, fillNumber } = body;
        const run = await TransactionHelper.provide(async () => {
            const queryBuilder = runId ? new QueryBuilder().where('id').is(runId) :
                new QueryBuilder().where('runNumber').is(runNumber);
            const runObject = await RunRepository.findOne(queryBuilder);
            if (runObject) {
                if (runQuality) {
                    runObject.runQuality = runQuality;
                }
                if (envId) {
                    runObject.envId = envId;
                }
                if (lhcBeamEnergy) {
                    runObject.lhcBeamEnergy = lhcBeamEnergy;
                }

                if (lhcBeamMode) {
                    runObject.lhcBeamMode = lhcBeamMode;
                }

                if (lhcBetaStar) {
                    runObject.lhcBetaStar = lhcBetaStar;
                }

                if (aliceL3Current) {
                    runObject.aliceL3Current = aliceL3Current;
                }

                if (aliceDipoleCurrent) {
                    runObject.aliceDipoleCurrent = aliceDipoleCurrent;
                }
                if (fillNumber) {
                    const lhc = await new GetLhcFillUseCase()
                        .execute({ params: { fillNumber } });
                    if (!lhc) {
                        return {
                            error: {
                                status: '400',
                                title: `LhcFill with id ('${fillNumber}') could not be found`,
                            },
                        };
                    }
                    runObject.fillNumber = fillNumber;
                }
                await runObject.save();
                return runObject;
            } else {
                return {
                    error: {
                        status: '400',
                        title: `Run with this ${runId ? 'id' : 'runNumber'} (${runId ? runId : runNumber}) could not be found`,
                    },
                };
            }
        });
        if (run.error) {
            return run;
        }
        const result = await new GetRunUseCase().execute({ params: { runId: run.id } });
        return { result };
    }
}

module.exports = UpdateRunUseCase;
