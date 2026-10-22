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

const { ctpTriggerCountersService } = require('../../services/ctpTriggerCounters/CtpTriggerCountersService.js');

/**
 * Controller to handle requests through gRPC CtpTriggerCounters
 */
class GRPCCtpTriggerCountersController {
    /**
     * Constructor
     */
    constructor() {
        this.ctpTriggerCountersService = ctpTriggerCountersService;
    }

    /**
     * Create or update the counters of a trigger class of a run
     *
     * @param {object} request the gRPC request
     * @param {number} request.runNumber the run number of the run for which counters are created/updated
     * @param {string} request.className the name of the trigger class for which counters are created/updated
     * @param {string|number} [request.timestamp] the timestamp of the measure (UNIX timestamp in milliseconds)
     * @param {number} request.lmb LM level counter before vetoes
     * @param {number} request.lma LM level counter after vetoes
     * @param {number} request.l0b L0 level counter before vetoes
     * @param {number} request.l0a L0 level counter after vetoes
     * @param {number} request.l1b L1 level counter before vetoes
     * @param {number} request.l1a L1 level counter after vetoes
     * @return {Promise<object>} resolves with an empty response once the counters have been created or updated
     */
    async CreateOrUpdateForRun({ runNumber, className, timestamp, lmb, lma, l0b, l0a, l1b, l1a }) {
        await this.ctpTriggerCountersService.createOrUpdatePerRun(
            { runNumber, className },
            { timestamp: timestamp !== undefined ? Number(timestamp) : timestamp, lmb, lma, l0b, l0a, l1b, l1a },
        );

        return {};
    }
}

exports.GRPCCtpTriggerCountersController = GRPCCtpTriggerCountersController;
