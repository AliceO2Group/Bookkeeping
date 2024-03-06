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

const { QCFlagTypesController } = require('../controllers/QCFlagTypes.controller.js');

exports.QCFlagsRouter = {
    path: '/qualityControlFlags',
    args: { public: false },
    children: [
        {
            path: '/types',
            children: [
                {
                    method: 'get',
                    controller: QCFlagTypesController.listQCFlagTypesHandler,
                },
                {
                    method: 'post',
                    controller: QCFlagTypesController.createQCFlagTypeHandler,
                },
                {
                    path: ':id',
                    children: [
                        {
                            method: 'get',
                            controller: QCFlagTypesController.getQCFlagTypeByIdHandler,
                        },
                        {
                            method: 'put',
                            controller: QCFlagTypesController.updateQCFlagTypeHandler,
                        },
                    ],
                },
            ],
        },
    ],
};
