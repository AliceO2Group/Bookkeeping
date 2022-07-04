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
        const { body, params } = dto;
        const { runId } = params;
        const {
            timeO2Start,
            timeO2End,
            timeTrgStart,
            timeTrgEnd,
            trgGlobalRunEnabled,
            trgEnabled,
            pdpConfigOption,
            pdpTopologyDescriptionLibraryFile,
            tfbDdMode,
        } = body;

        return await TransactionHelper.provide(async () => {
            body.userId = dto?.session?.id || 0;

            const queryBuilder = new QueryBuilder().where('runNumber').is(runId);

            const runEntity = await RunRepository.findOne(queryBuilder);

            if (runEntity) {
                if (timeO2End && timeO2End > 0) {
                    runEntity.timeO2End = timeO2End;
                }
                if (timeO2Start && timeO2Start > 0) {
                    runEntity.timeO2Start = timeO2Start;
                }
                if (timeTrgEnd && timeTrgEnd > 0) {
                    runEntity.timeTrgEnd = timeTrgEnd;
                }
                if (timeTrgStart && timeTrgStart > 0) {
                    runEntity.timeTrgStart = timeTrgStart;
                }
                //TODO: verify if statement with george
                runEntity.trgGlobalRunEnabled = trgGlobalRunEnabled;
                runEntity.trgEnabled = trgEnabled;
                if (pdpConfigOption) {
                    runEntity.pdpConfigOption = pdpConfigOption;
                }
                if (pdpTopologyDescriptionLibraryFile) {
                    runEntity.pdpTopologyDescriptionLibraryFile = pdpTopologyDescriptionLibraryFile;
                }
                if (tfbDdMode) {
                    runEntity.tfbDdMode = tfbDdMode;
                }
                await runEntity.save();
            } else {
                return {
                    error: {
                        status: '400',
                        title: `run with this id (${runId}) could not be found`,
                    },
                };
            }
            return { result: RunAdapter.toEntity(runEntity) };
        });
    }
}

module.exports = EndRunUseCase;
