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

const { flpService } = require('../../services/flp/FlpService.js');

/**
 * Controller to handle requests through gRPC FlpService
 */
class GRPCFlpController {
    /**
     * Constructor
     */
    constructor() {
        this.flpService = flpService;
    }

    // eslint-disable-next-line require-jsdoc
    async CreateMany({ flps }) {
        const createdFlps = [];
        for (const { name, hostName, runNumber } of flps) {
            createdFlps.push(await this.flpService.create({ name, hostName }, runNumber));
        }
        return { flps: createdFlps };
    }
}

exports.GRPCFlpController = GRPCFlpController;
