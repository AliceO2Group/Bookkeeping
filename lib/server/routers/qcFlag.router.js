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

const { BkpRoles } = require('../../domain/enums/BkpRoles.js');
const { QcFlagController } = require('../controllers/qcFlag.controller.js');
const { rbacMiddleware } = require('../middleware/rbac.middleware.js');

exports.qcFlagsRouter = {
    path: '/qcFlags',
    children: [
        {
            path: 'gaq',
            method: 'get',
            controller: QcFlagController.getGaqQcFlagsHandler,
        },
        {
            path: 'summary',
            method: 'get',
            controller: QcFlagController.getQcFlagsSummaryHandler,

            children: [
                {
                    path: 'gaq',
                    method: 'get',
                    controller: QcFlagController.getGaqSummaryHandler,
                },
            ],
        },
        {
            path: 'perDataPass',
            children: [
                {
                    method: 'get',
                    controller: QcFlagController.listQcFlagsPerDataPassHandler,
                },
                {
                    method: 'delete',
                    controller: [rbacMiddleware([BkpRoles.DPG_ASYNC_QC_ADMIN]), QcFlagController.deleteQcFlagsByDataPassHandler],
                },
            ],
        },
        {
            path: 'perSimulationPass',
            method: 'get',
            controller: QcFlagController.listQcFlagsPerSimulationPassHandler,
        },
        {
            path: 'synchronous',
            method: 'get',
            controller: QcFlagController.listSynchronousQcFlagsHandler,
        },
        {
            path: ':id',
            children: [
                {
                    method: 'get',
                    controller: QcFlagController.getQcFlagByIdHandler,
                },
                {
                    method: 'delete',
                    controller: [rbacMiddleware(BkpRoles.ADMIN), QcFlagController.deleteQcFlagByIdHandler],
                },
                {
                    method: 'post',
                    path: 'verify',
                    controller: QcFlagController.verifyQcFlagHandler,
                },
            ],
        },
        {
            method: 'post',
            controller: QcFlagController.createQcFlagsHandler,
        },
    ],
};
