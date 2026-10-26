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

const { DataPassesController } = require('../controllers/dataPasses.controller.js');
const { rbacMiddleware } = require('../middleware/rbac.middleware.js');
const { BkpRoles } = require('../../domain/enums/BkpRoles.js');

exports.dataPassesRouter = {
    path: '/dataPasses',
    method: 'get',
    controller: DataPassesController.listDataPassesHandler,

    children: [
        {
            path: '/freeze',
            method: 'patch',
            controller: [rbacMiddleware([BkpRoles.DPG_ASYNC_QC_ADMIN]), DataPassesController.freezeHandler],
        },
        {
            path: '/unfreeze',
            method: 'patch',
            controller: [rbacMiddleware([BkpRoles.DPG_ASYNC_QC_ADMIN]), DataPassesController.unfreezeHandler],
        },
        {
            path: '/skimming',

            children: [
                {
                    path: '/markSkimmable',
                    method: 'patch',
                    controller: DataPassesController.markAsSkimmableHandler,
                },
                {
                    path: '/runs',
                    children: [
                        {
                            method: 'get',
                            controller: DataPassesController.fetchSkimmableRunsHandler,
                        },
                        {
                            method: 'put',
                            controller: DataPassesController.updateReadyForSkimmingRunsHandler,
                        },
                    ],
                },
            ],
        },
    ],
};
