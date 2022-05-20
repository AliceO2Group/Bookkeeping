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

const { LhcFillsController } = require('../controllers');

module.exports = {
    path: '/lhcFills',
    args: { public: true },
    children: [
        {
            method: 'get',
            controller: LhcFillsController.listLhcFills,
        },
        {
            method: 'post',
            controller: LhcFillsController.createLhcFill,
        },
        {
            path: ':fillNumber',
            children: [
                {
                    method: 'get',
                    controller: LhcFillsController.getLhcFillById,
                },
                {
                    method: 'patch',
                    controller: LhcFillsController.updateLhcFills,
                },
                {
                    path: 'runs',
                    children: [
                        {
                            method: 'get',
                            controller: LhcFillsController.listRuns,
                        },
                        {
                            path: ':runNumber',
                            method: 'get',
                            controller: LhcFillsController.getRunByRunNumber,
                        },
                    ],
                },
            ],
        },
    ],

};
