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

const { GRPCRunController } = require('../controllers/gRPC/GRPCRunController.js');
const { GRPCLogController } = require('../controllers/gRPC/GRPCLogController.js');
const { GRPCFlpRoleController } = require('../controllers/gRPC/GRPCFlpRoleController.js');
const { GRPCEnvironmentController } = require('../controllers/gRPC/GRPCEnvironmentController.js');
const { GRPCLhcFillController } = require('../controllers/gRPC/GRPCLhcFIllController.js');
const { GRPCDplProcessExecutionController } = require('../controllers/gRPC/GRPCDplProcessExecutionController.js');

/**
 * Object containing for each proto name (properties' name) a list of object containing the service definition and its corresponding service
 * implementation
 */
exports.servicesImplementationsMappings = {
    run: [
        {
            service: 'o2.bookkeeping.RunService',
            implementation: new GRPCRunController(),
        },
    ],
    log: [
        {
            service: 'o2.bookkeeping.LogService',
            implementation: new GRPCLogController(),
        },
    ],
    flp: [
        {
            service: 'o2.bookkeeping.FlpService',
            implementation: new GRPCFlpRoleController(),
        },
    ],
    environment: [
        {
            service: 'o2.bookkeeping.EnvironmentService',
            implementation: new GRPCEnvironmentController(),
        },
    ],
    lhcFill: [
        {
            service: 'o2.bookkeeping.LhcFillService',
            implementation: new GRPCLhcFillController(),
        },
    ],
    dplProcessExecution: [
        {
            service: 'o2.bookkeeping.DplProcessExecutionService',
            implementation: new GRPCDplProcessExecutionController(),
        },
    ],
};
