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
const { BkpRoles } = require('../../domain/enums/BkpRoles.js');

module.exports = {
    path: '/tags',
    children: [
        {
            method: 'get',
            path: 'name',
            controller: TagsController.getTagByName,
        },
        {
            method: 'get',
            controller: TagsController.listTags,
        },
        {
            method: 'post',
            controller: [rbacMiddleware([BkpRoles.ADMIN]), TagsController.createTag],
        },
        {
            path: ':tagId',
            children: [
                {
                    method: 'get',
                    controller: TagsController.getTagById,
                },
                {
                    method: 'put',
                    controller: [rbacMiddleware([BkpRoles.ADMIN]), TagsController.updateTagById],
                },
                {
                    method: 'get',
                    path: '/runs',
                    controller: TagsController.getRuns,
                },
                {
                    method: 'get',
                    path: '/logs',
                    controller: TagsController.getLogsByTagId,
                },
                {
                    method: 'get',
                    path: '/runs',
                    controller: TagsController.patchRun,
                },
                {
                    method: 'get',
                    path: '/log',
                    controller: TagsController.patchLog,
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
