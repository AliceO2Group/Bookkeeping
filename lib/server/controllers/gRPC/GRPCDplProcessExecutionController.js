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

const { dplProcessService } = require('../../services/dpl/DplProcessService.js');
const { snakeToPascal } = require('../../../utilities/stringUtils.js');

/**
 * Controller to handle requests through gRPC EnvironmentService
 */
class GRPCDplProcessExecutionController {
    /**
     * Constructor
     */
    constructor() {
        this.dplProcessService = dplProcessService;
    }

    // eslint-disable-next-line require-jsdoc
    async Create(newDplProcessExecution) {
        const {
            runNumber,
            detectorName,
            processName,
            type,
            hostname,
            args,
        } = newDplProcessExecution;

        return this.dplProcessService.createProcessExecution(
            { args },
            {
                runIdentifier: { runNumber },
                detectorName,
                processName,
                processTypeLabel: snakeToPascal(type),
                hostname: hostname,
            },
        );
    }
}

exports.GRPCDplProcessExecutionController = GRPCDplProcessExecutionController;
