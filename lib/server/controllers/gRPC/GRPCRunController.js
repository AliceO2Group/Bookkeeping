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
    async Create(newRunRequest) {
        const { run, relations } = this.gRPCToRunAndRelations(newRunRequest);

        return this.runToGRPC(await this.runService.create(run, { runTypeName: relations.runType?.name }));
    }

    // eslint-disable-next-line require-jsdoc
    async Update(runPatchRequest) {
        const { run, relations } = this.gRPCToRunAndRelations(runPatchRequest);
        const { runNumber } = run;
        delete run.runNumber;

        return this.runToGRPC(await this.runService.update({ runNumber }, run, { runTypeName: relations.runType?.name }));
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
        return {
            ...run,
            detectors,
            runType,
        };
    }

    /**
     * Convert a run related gRPC request to a run and its relations
     *
     * @param {Object} gRPCRunRequest the run related request
     * @return {{run: Run, relations: {runType: (RunType|undefined)}}} the run and its relation
     */
    gRPCToRunAndRelations(gRPCRunRequest) {
        if (gRPCRunRequest.detectors) {
            gRPCRunRequest.detectors = gRPCRunRequest.detectors.join(',');
        }

        const relations = {};
        if (gRPCRunRequest.runType) {
            relations.runType = { name: gRPCRunRequest.runType };
            delete gRPCRunRequest.runType;
        }

        return { run: gRPCRunRequest, relations };
    }
}

exports.GRPCRunController = GRPCRunController;
