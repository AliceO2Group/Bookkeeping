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
const { runAdapter } = require('../../../database/adapters/index');

/**
 * Controller to handle requests through gRPC RunService
 */
class GRPCRunController {
    /**
     * Constructor
     */
    constructor() {
        this.runService = runService;
        this.runAdapter = runAdapter;
    }

    // eslint-disable-next-line require-jsdoc
    async Get({ runNumber, relations }) {
        const run = await this.runService.getOrFail({ runNumber }, { lhcFill: relations.includes('LHC_FILL') });
        const { lhcFill } = run;
        delete run.lhcFill;
        return { run: this.runAdapter.toGRPC(run), lhcFill };
    }

    // eslint-disable-next-line require-jsdoc
    async Create(newRunRequest) {
        const { run, relations } = this.gRPCToRunAndRelations(newRunRequest);

        return this.runAdapter.toGRPC(await this.runService.create(
            run,
            {
                runTypeName: relations.runType?.name,
                userO2Start: relations.userO2Start,
                userO2Stop: relations.userO2Stop,
            },
        ));
    }

    // eslint-disable-next-line require-jsdoc
    async Update(runPatchRequest) {
        const { run, relations } = this.gRPCToRunAndRelations(runPatchRequest);
        const { runNumber } = run;
        delete run.runNumber;

        return this.runAdapter.toGRPC(await this.runService.update(
            { runNumber },
            {
                runPatch: run,
                relations: {
                    runTypeName: relations.runType?.name,
                    eorReasons: relations.eorReasons,
                    userO2Start: relations.userO2Start,
                    userO2Stop: relations.userO2Stop,
                    lhcPeriodName: relations.lhcPeriod?.name,
                },
            },
        ));
    }

    /**
     * Convert a run related gRPC request to a run and its relations
     *
     * @param {Object} gRPCRunRequest the run related request
     * @return {{run: Run, relations: {runType: (RunType|undefined)}}} the run and its relation
     */
    gRPCToRunAndRelations(gRPCRunRequest) {
        // Convert to number the dates that are currently bigint
        gRPCRunRequest.timeO2Start = gRPCRunRequest.timeO2Start !== undefined ? Number(gRPCRunRequest.timeO2Start) : undefined;
        gRPCRunRequest.timeO2End = gRPCRunRequest.timeO2End !== undefined ? Number(gRPCRunRequest.timeO2End) : undefined;
        gRPCRunRequest.timeTrgStart = gRPCRunRequest.timeTrgStart !== undefined ? Number(gRPCRunRequest.timeTrgStart) : undefined;
        gRPCRunRequest.timeTrgEnd = gRPCRunRequest.timeTrgEnd !== undefined ? Number(gRPCRunRequest.timeTrgEnd) : undefined;

        if (gRPCRunRequest.detectors) {
            gRPCRunRequest.detectors = gRPCRunRequest.detectors.join(',');
        }

        const relations = {};
        if (gRPCRunRequest.runType) {
            relations.runType = { name: gRPCRunRequest.runType };
            delete gRPCRunRequest.runType;
        }

        if (gRPCRunRequest.eorReasons) {
            relations.eorReasons = gRPCRunRequest.eorReasons;
            delete gRPCRunRequest.eorReasons;
        }

        if (gRPCRunRequest.userO2Start) {
            relations.userO2Start = gRPCRunRequest.userO2Start;
            delete gRPCRunRequest.userO2Start;
        }
        if (gRPCRunRequest.userO2Stop) {
            relations.userO2Stop = gRPCRunRequest.userO2Stop;
            delete gRPCRunRequest.userO2Stop;
        }

        if (gRPCRunRequest.lhcPeriod) {
            relations.lhcPeriod = { name: gRPCRunRequest.lhcPeriod };
            delete gRPCRunRequest.lhcPeriod;
        }

        return { run: gRPCRunRequest, relations };
    }
}

exports.GRPCRunController = GRPCRunController;
