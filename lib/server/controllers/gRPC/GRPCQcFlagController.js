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

const { qcFlagService } = require('../../services/qualityControlFlag/QcFlagService.js');

/**
 * Controller to handle requests through gRPC QcFlagService
 */
class GRPCQcFlagController {
    /**
     * Constructor
     */
    constructor() {
        this.qcFlagService = qcFlagService;
    }

    // eslint-disable-next-line require-jsdoc
    async CreateForDataPass({ runNumber, detectorName, passName, flags }) {
        const qcFlags = await this.qcFlagService.create(
            flags.map(({ from, to, ...flag }) => ({
                ...flag,
                from: from !== undefined ? Number(from) : from,
                to: to !== undefined ? Number(to) : to,
            })),
            { runNumber, dplDetectorIdentifier: { dplDetectorName: detectorName }, dataPassIdentifier: { name: passName } },
            { userIdentifier: { externalUserId: 0 } },
        );

        return {
            flagIds: qcFlags.map(({ id }) => id),
        };
    }

    // eslint-disable-next-line require-jsdoc
    async CreateForSimulationPass({ runNumber, detectorName, productionName, flags }) {
        const qcFlags = await this.qcFlagService.create(
            flags.map(({ from, to, ...flag }) => ({
                ...flag,
                from: from !== undefined ? Number(from) : from,
                to: to !== undefined ? Number(to) : to,
            })),
            { runNumber, dplDetectorIdentifier: { dplDetectorName: detectorName }, simulationPassIdentifier: { name: productionName } },
            { userIdentifier: { externalUserId: 0 } },
        );

        return {
            flagIds: qcFlags.map(({ id }) => id),
        };
    }
}

exports.GRPCQcFlagController = GRPCQcFlagController;
