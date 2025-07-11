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

const { dataPassService } = require('../../services/dataPasses/DataPassService.js');
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
        this.dataPassService = dataPassService;
    }

    // eslint-disable-next-line jsdoc/require-jsdoc
    async CreateForDataPass({ runNumber, detectorName, passName, flags }) {
        const qcFlags = await this.qcFlagService.create(
            flags.map(({ from, to, ...flag }) => ({
                ...flag,
                from: from !== undefined ? Number(from) : from,
                to: to !== undefined ? Number(to) : to,
            })),
            {
                runNumber,
                detectorIdentifier: { detectorName },
                dataPassIdentifier: { name: await this.dataPassService.getFullDataPassNameUsingRunPeriod(passName, runNumber) },
            },
            { user: { externalUserId: 0, roles: ['admin'] } },
        );

        return {
            flagIds: qcFlags.map(({ id }) => id),
        };
    }

    // eslint-disable-next-line jsdoc/require-jsdoc
    async CreateForSimulationPass({ runNumber, detectorName, productionName, flags }) {
        const qcFlags = await this.qcFlagService.create(
            flags.map(({ from, to, ...flag }) => ({
                ...flag,
                from: from !== undefined ? Number(from) : from,
                to: to !== undefined ? Number(to) : to,
            })),
            { runNumber, detectorIdentifier: { detectorName }, simulationPassIdentifier: { name: productionName } },
            { user: { externalUserId: 0, roles: ['admin'] } },
        );

        return {
            flagIds: qcFlags.map(({ id }) => id),
        };
    }

    // eslint-disable-next-line jsdoc/require-jsdoc
    async CreateSynchronous({ runNumber, detectorName, flags }) {
        const qcFlags = await this.qcFlagService.create(
            flags.map(({ from, to, ...flag }) => ({
                ...flag,
                from: from !== undefined ? Number(from) : from,
                to: to !== undefined ? Number(to) : to,
            })),
            { runNumber, detectorIdentifier: { detectorName } },
            { user: { externalUserId: 0, roles: ['admin'] } },
        );

        return {
            flagIds: qcFlags.map(({ id }) => id),
        };
    }
}

exports.GRPCQcFlagController = GRPCQcFlagController;
