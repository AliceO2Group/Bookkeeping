/*
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
    async Create(newRun) {
        return this.runService.create(newRun);
    }

    // eslint-disable-next-line require-jsdoc
    async Update(runPatch) {
        const { runNumber } = runPatch;
        delete runPatch.runNumber;

        const run = await this.runService.update({ runNumber }, runPatch);
        // The gRPC proto expect a list of detectors, do the conversion
        const detectors = run.detectors?.split(',')?.map((detector) => detector.trim());

        return {
            ...run,
            detectors,
        };
    }
}

exports.GRPCRunController = GRPCRunController;
