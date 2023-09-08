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

const { BkpRoles, BKP_ROLES } = require('../../domain/enums/BkpRoles');
const { RunsController } = require('../controllers');
const { rbacMiddleware, rbacMiddlewareDetectors } = require('../middleware/rbac.middleware');

module.exports = {
    path: '/runs',
    args: { public: true },
    children: [
        {
            method: 'get',
            path: 'reasonTypes',
            controller: [rbacMiddleware(BKP_ROLES), RunsController.listReasonTypes],
        },
        {
            method: 'get',
            controller: [rbacMiddleware(BKP_ROLES), RunsController.listRuns],
        },
        {
            path: ':runId',
            children: [
                {
                    method: 'get',
                    controller: [rbacMiddleware(BKP_ROLES), RunsController.getRunById],
                },
                {
                    method: 'put',
                    controller: [rbacMiddlewareDetectors([BkpRoles.ADMIN]), RunsController.updateRun],
                },
                {
                    method: 'get',
                    path: 'logs',
                    controller: [rbacMiddleware(BKP_ROLES), RunsController.getLogsByRunId],
                },
                {
                    method: 'get',
                    path: 'flps',
                    controller: [rbacMiddleware(BKP_ROLES), RunsController.getFlpsByRunId],
                },
                {
                    method: 'patch',
                    controller: [rbacMiddleware(BkpRoles.ADMIN), RunsController.endRun],
                },
            ],
        },
        {
            method: 'post',
            controller: [rbacMiddleware(BkpRoles.ADMIN), RunsController.startRun],
        },
        {
            method: 'get',
            path: 'tags',
            controller: [rbacMiddleware(BKP_ROLES), RunsController.listTagsByRunId],
        },
        {
            method: 'patch',
            controller: [rbacMiddleware([BkpRoles.ADMIN]), RunsController.updateRunByRunNumber],
        },
    ],
};
