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

const { RunsController } = require('../controllers');

module.exports = {
    children: [
        {
            path: '/runs',
            args: { public: false },
            children: [
                {
                    method: 'get',
                    path: 'reasonTypes',
                    controller: RunsController.listReasonTypes,
                },
                {
                    method: 'get',
                    controller: RunsController.listRuns,
                },
                {
                    path: ':runNumber',
                    children: [
                        {
                            method: 'get',
                            controller: RunsController.getRunByIdentifierHandler,
                        },
                        {
                            method: 'put',
                            controller: RunsController.updateRun,
                        },
                        {
                            method: 'get',
                            path: 'logs',
                            controller: RunsController.getLogsByRunNumberHandler,
                        },
                        {
                            method: 'get',
                            path: 'flps',
                            controller: RunsController.getFlpsByRunNumberHandler,
                        },
                        {
                            method: 'patch',
                            controller: RunsController.endRun,
                        },
                    ],
                },
                {
                    method: 'post',
                    controller: RunsController.startRun,
                },
                {
                    method: 'patch',
                    controller: RunsController.updateRunByRunNumber,
                },
            ],
        }, {
            path: '/legacy/runs',
            args: { public: false },
            children: [
                {
                    path: ':runId',
                    children: [
                        {
                            method: 'get',
                            controller: RunsController.getRunByIdentifierHandler,
                        },
                    ],
                },
            ],
        },
    ],
};
