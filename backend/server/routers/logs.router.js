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

const { LogsController } = require('../controllers');
const { multerMiddleware: { attachmentMiddleware } } = require('../middleware');

module.exports = {
    method: 'get',
    path: '/logs',
    controller: LogsController.listLogs,
    args: { public: false },
    children: [
        {
            method: 'post',
            controller: [attachmentMiddleware, LogsController.createLog],
        },
        {
            method: 'get',
            path: ':logId',
            controller: LogsController.getLogById,
            children: [
                {
                    method: 'get',
                    path: 'attachments',
                    controller: LogsController.getAllAttachments,
                    children: [
                        {
                            method: 'get',
                            path: ':attachmentId',
                            controller: LogsController.getAttachment,
                        },
                    ],
                },
                {
                    method: 'patch',
                    path: 'runs',
                    controller: LogsController.patchRun,
                },
                {
                    method: 'get',
                    path: 'tags',
                    controller: LogsController.listTagsByLogId,
                },
                {
                    method: 'get',
                    path: 'tree',
                    controller: LogsController.getLogTree,
                },
            ],
        },
    ],
};
