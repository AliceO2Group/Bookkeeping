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

module.exports = {
    path: '/tags',
    args: { public: false },
    children: [
        {
            method: 'get',
            controller: TagsController.listTags,
            args: { public: true },
        },
        {
            method: 'post',
            controller: TagsController.createTag,
        },
        {
            method: 'get',
            path: ':tagId',
            controller: TagsController.getTagById,
            children: [
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
                    controller: TagsController.deleteTag,
                },
            ],
        },
        {
            method: 'get',
            path: 'name',
            args: { public: true },
            controller: TagsController.getNotificationByTagName,
        },
    ],
};
