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

const { environmentService } = require('../../services/environment/EnvironmentService.js');
const { runAdapter } = require('../../../database/adapters/index');

/**
 * Controller to handle requests through gRPC EnvironmentService
 */
class GRPCEnvironmentController {
    /**
     * Constructor
     */
    constructor() {
        this.environmentService = environmentService;
        this.runAdapter = runAdapter;
    }

    // eslint-disable-next-line require-jsdoc
    async Create(newEnvironment) {
        const { id, status, statusMessage } = newEnvironment;
        return this.environmentService.create({ id }, { status, statusMessage });
    }

    // eslint-disable-next-line require-jsdoc
    async Update(environmentPatch) {
        const { id: environmentId, toredownAt, status, statusMessage } = environmentPatch;

        const updatedEnvironment = await this.environmentService.update(
            environmentId,
            { toredownAt: toredownAt !== undefined ? Number(toredownAt) : toredownAt },
            { status, statusMessage },
        );

        return {
            ...updatedEnvironment,
            runs: updatedEnvironment.runs ? updatedEnvironment.runs.map((run) => this.runAdapter.toGRPC(run)) : updatedEnvironment.runs,
        };
    }
}

exports.GRPCEnvironmentController = GRPCEnvironmentController;
