/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

const { triggerCountersService } = require('../../services/triggerCounters/TriggerCountersService.js');

/**
 * Controller to handle requests through gRPC TriggerCounters
 */
class GRPCTriggerCountersController {
    /**
     * Constructor
     */
    constructor() {
        this.triggerCountersService = triggerCountersService;
    }

    // eslint-disable-next-line require-jsdoc
    async CreateOrUpdateForRun({ runNumber, className, timestamp, lmb, lma, l0b, l0a, l1b, l1a }) {
        await this.triggerCountersService.createOrUpdatePerRun(
            { runNumber, className },
            { timestamp: timestamp !== undefined ? Number(timestamp) : timestamp, lmb, lma, l0b, l0a, l1b, l1a },
        );

        return {};
    }
}

exports.GRPCTriggerCountersController = GRPCTriggerCountersController;
