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

/**
 * Controller to handle requests through gRPC EnvironmentService
 */
class GRPCEnvironmentController {
    /**
     * Constructor
     */
    constructor() {
        this.environmentService = environmentService;
    }

    // eslint-disable-next-line require-jsdoc
    async Create(newEnvironment) {
        return this.environmentService.create(newEnvironment);
    }

    // eslint-disable-next-line require-jsdoc
    async Update(environmentPatch) {
        const { id: environmentId } = environmentPatch;
        delete environmentPatch.id;
        return this.environmentService.update(environmentId, environmentPatch);
    }
}

exports.GRPCEnvironmentController = GRPCEnvironmentController;
