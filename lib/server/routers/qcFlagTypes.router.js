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
const { QcFlagTypesController } = require('../controllers/qcFlagTypes.controller.js');
const { rbacMiddleware } = require('../middleware/rbac.middleware.js');

exports.qcFlagTypesRouter = {
    path: '/qcFlagTypes',
    children: [
        {
            path: ':id',
            children: [
                {
                    method: 'get',
                    controller: QcFlagTypesController.getQcFlagTypeByIdHandler,
                },
                {
                    method: 'put',
                    controller: [rbacMiddleware(BkpRoles.ADMIN), QcFlagTypesController.updateQcFlagTypeHandler],
                },
            ],
        },
        {
            method: 'get',
            path: ':id',
            controller: QcFlagTypesController.getQcFlagTypeByIdHandler,
        },
        {
            method: 'get',
            controller: QcFlagTypesController.listQcFlagTypesHandler,
        },
        {
            method: 'post',
            controller: [rbacMiddleware(BkpRoles.ADMIN), QcFlagTypesController.createQCFlagTypeHandler],
        },
    ],
};
