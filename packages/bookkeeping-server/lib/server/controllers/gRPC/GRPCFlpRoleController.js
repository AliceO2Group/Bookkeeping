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

const { flpRoleService } = require('../../services/flp/FlpRoleService.js');

/**
 * Controller to handle requests through gRPC FlpRoleService
 */
class GRPCFlpRoleController {
    /**
     * Constructor
     */
    constructor() {
        this.flpRoleService = flpRoleService;
    }

    // eslint-disable-next-line require-jsdoc
    async CreateMany({ flps }) {
        const createdFlps = [];
        for (const { name, hostname, runNumber } of flps) {
            try {
                createdFlps.push(await this.flpRoleService.create({ name, hostname, runNumber }));
            } catch (e) {
                // TODO log into infologger
            }
        }
        return { flps: createdFlps };
    }

    // eslint-disable-next-line require-jsdoc
    async UpdateCounters({
        flpName,
        runNumber,
        nSubTimeframes,
        nEquipmentBytes,
        nRecordingBytes,
        nFairMQBytes,
    }) {
        return await this.flpRoleService.update(
            { flpName, runNumber },
            {
                nTimeframes: nSubTimeframes,
                bytesEquipmentReadOut: nEquipmentBytes,
                bytesRecordingReadOut: nRecordingBytes,
                bytesFairMQReadOut: nFairMQBytes,
            },
        );
    }
}

exports.GRPCFlpRoleController = GRPCFlpRoleController;
