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

const { TagsController } = require('../controllers');
const { rbacMiddleware } = require('../middleware/rbac.middleware.js');
const { BkpRoles, BKP_ROLES } = require('../../domain/enums/BkpRoles.js');

module.exports = {
    path: '/tags',
    args: { public: false },
    children: [
        {
            method: 'get',
            path: 'name',
            args: { public: true },
            controller: [rbacMiddleware(BKP_ROLES), TagsController.getTagByName],
        },
        {
            method: 'get',
            controller: [rbacMiddleware(BKP_ROLES), TagsController.listTags],
            args: { public: true },
        },
        {
            method: 'post',
            controller: [rbacMiddleware([BkpRoles.ADMIN, BkpRoles.GUEST, BkpRoles.GLOBAL]), TagsController.createTag],
        },
        {
            path: ':tagId',
            children: [
                {
                    method: 'get',
                    controller: [rbacMiddleware(BKP_ROLES), TagsController.getTagById],
                },
                {
                    method: 'get',
                    path: '/runs',
                    controller: [rbacMiddleware(BKP_ROLES), TagsController.getRuns],
                },
                {
                    method: 'get',
                    path: '/logs',
                    controller: [rbacMiddleware(BKP_ROLES), TagsController.getLogsByTagId],
                },
                {
                    method: 'get',
                    path: '/runs',
                    controller: [rbacMiddleware(BKP_ROLES), TagsController.patchRun],
                },
                {
                    method: 'get',
                    path: '/log',
                    controller: [rbacMiddleware(BKP_ROLES), TagsController.patchLog],
                },
                {
                    method: 'put',
                    controller: [rbacMiddleware([BkpRoles.ADMIN]), TagsController.updateTagById],
                },
                {
                    method: 'delete',
                    path: '',
                    controller: [rbacMiddleware([BkpRoles.ADMIN]), TagsController.deleteTag],
                },
            ],
        },
    ],
};
