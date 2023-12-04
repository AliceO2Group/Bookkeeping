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

const { runService } = require('../../services/run/RunService.js');
const ReasonTypeRepository = require('../../../database/repositories/ReasonTypeRepository.js');
const { QueryBuilder } = require('../../../database/utilities/QueryBuilder.js');
const { logger } = require('../../../database/index.js');

/**
 * Controller to handle requests through gRPC RunService
 */
class GRPCRunController {
    /**
     * Constructor
     */
    constructor() {
        this.runService = runService;
    }

    // eslint-disable-next-line require-jsdoc
    async Get({ runNumber, relations }) {
        const run = await this.runService.getOrFail({ runNumber }, { lhcFill: relations.includes('LHC_FILL') });
        const { lhcFill } = run;
        delete run.lhcFill;
        return { run: this.runToGRPC(run), lhcFill };
    }

    // eslint-disable-next-line require-jsdoc
    async Create(newRunRequest) {
        const { run, relations } = this.gRPCToRunAndRelations(newRunRequest);

        return this.runToGRPC(await this.runService.create(run, { runTypeName: relations.runType?.name }));
    }

    // eslint-disable-next-line require-jsdoc
    async Update(runPatchRequest) {
        // Await conversion to keep correct sequence of code execution
        const { run, relations } = await this.gRPCToRunAndRelations(runPatchRequest);
        const { runNumber } = run;
        delete run.runNumber;

        return this.runToGRPC(await this.runService.update(
            { runNumber },
            {
                runPatch: run,
                relations: {
                    runTypeName: relations.runType?.name,
                    eorReasons: relations.eorReasons,
                },
            },
        ));
    }

    /**
     * Converts a run entity to a gRPC run message
     *
     * @param {Run} run the run to convert to gRPC
     * @return {Object} the run message
     */
    runToGRPC(run) {
        // The gRPC proto expect a list of detectors, do the conversion
        const detectors = run.detectors?.split(',')?.map((detector) => detector.trim());
        // The proto expect the run type name and not the run type related entity
        const runType = run.runType?.name ?? undefined;
        const { lhcPeriod } = run;

        return {
            ...run,
            detectors,
            runType,
            lhcPeriod: lhcPeriod?.name,
        };
    }

    /**
     * Convert a run related gRPC request to a run and its relations
     *
     * @param {Object} gRPCRunRequest the run related request
     * @return {{run: Run, relations: {runType: (RunType|undefined)}}} the run and its relation
     */
    async gRPCToRunAndRelations(gRPCRunRequest) {
        if (gRPCRunRequest.detectors) {
            gRPCRunRequest.detectors = gRPCRunRequest.detectors.join(',');
        }

        const relations = {};
        if (gRPCRunRequest.runType) {
            relations.runType = { name: gRPCRunRequest.runType };
            delete gRPCRunRequest.runType;
        }

        /*
         * TODO: eorReasons is an empty array for some reason
         */
        if (gRPCRunRequest.eorReasons) {
            logger.info('test');
            console.log(gRPCRunRequest);

            /*
             * TODO: remove when fixed, this is temp EorReasons to go on with the task
             * No id means it is not yet in the db, so RunService.update will save as new one
             */
            const tempEorReasons = [
                {
                    category: 'DETECTORS',
                    title: 'CPV',
                    description: 'test1',
                },
                {
                    category: 'DETECTORS',
                    title: 'TPC',
                    description: 'test2',
                },
                {
                    category: 'DETECTORS',
                    title: 'TPC',
                    description: 'test3',
                },
                {
                    category: 'nonExisting',
                    title: 'TPC',
                    description: 'non existing reasonType',
                },
            ];
            // TODO: 
            const convertedEorReasons = await convertEorReasonstoReasonTypeId(tempEorReasons);
            relations.eorReasons = convertedEorReasons;
        }

        const { lhcPeriod } = gRPCRunRequest;
        gRPCRunRequest.lhcPeriod = lhcPeriod ? { name: lhcPeriod } : lhcPeriod;

        return { run: gRPCRunRequest, relations };
    }
}

/**
 * Helper function to convert all Eor reasons to id, reasonTypeId and description.
 * This is necessary because this avoids code duplication, this is the format that
 * the RunService.update expects, therefore it can take care of handling these eorReasons.
 *
 * This helper function also removes invalid EorReasons.
 *
 * @param {Array<EorReason>} eorReasons the list of eorReasons
 * @return {Array<EorReason>} list with only the valid eorReasons
 */
const convertEorReasonstoReasonTypeId = async (eorReasons) => {
    if (!eorReasons || eorReasons.length === 0) {
        return eorReasons;
    }

    // Use Promise instead of .forEach because otherwise it will not execute in the correct sequence
    const convertedEorReasons = await Promise.all(eorReasons.map(async ({ id, category, title, description }) => {
        const tempQueryBuilder = new QueryBuilder();
        tempQueryBuilder.where('category').is(category).andWhere('title', title);

        // TODO: findAll with OR and like. FetchAll with specific category and title.
        // Max few hundreds, better fetch all -> create map with key is what I want
        // Array with every concatenated category + title, so like this: "categorytitle".
        // USE JSON.STRINGIFY to prevent conflicts.

        const tempReasonType = await ReasonTypeRepository.findOne(tempQueryBuilder);

        if (tempReasonType) {
            return {
                id,
                reasonTypeId: tempReasonType.id,
                description,
            };
        }

        // Return null when tempReasonType is not found
        return null;
    }));

    // Remove null entries
    return convertedEorReasons.filter(Boolean);
};

exports.GRPCRunController = GRPCRunController;
