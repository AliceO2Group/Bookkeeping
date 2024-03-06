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
import spinner from '../../../components/common/spinner.js';
import { h, sessionService } from '/js/src/index.js';
import errorAlert from '../../../components/common/errorAlert.js';
import { BkpRoles } from '../../../domain/enums/BkpRoles.js';
import { qcFlagTypeDetailsList } from './qcFlagTypeDetails.js';

/**
 * Returns the component to display the details of a given QC Flag Type
 *
 * @param {Model} globalModel the global model
 * @return {Component} QC Flag details display
 */
export const QCFlagTypeDetailsPage = ({ qcFlagTypes: { detailsModel } }) => detailsModel.item.match({
    NotAsked: () => null,
    Loading: () => spinner(),
    Failure: (errors) => errors.map(errorAlert),
    Success: (qcFlagType) => [
        h('.flex-column.w-100', [
            h('.w-100.flex-row', [
                h('.flex-row.items-center.gc3', [
                    h('h2.mv2.flex-row', `QC Flag Type: ${qcFlagType.name}`),
                    qcFlagType.archived ? h('.f4.badge.bg-gray-darker.white', 'Archived') : null,
                ]),
                h('.flex-grow.flex-row.items-center', {
                    style: 'justify-content: flex-end;',
                }, sessionService.hasAccess(BkpRoles.ADMIN) && h('.btn-group', [
                    detailsModel.isEditModeEnabled ?
                        [
                            h('.button.btn.btn-success#confirm-edit', {
                                onclick: () => {
                                    detailsModel.submitPatch();
                                },
                            }, 'Save'),
                            h('.button.btn#cancel-edit', { onclick: () => {
                                detailsModel.resetPatch();
                                detailsModel.isEditModeEnabled = false;
                            } }, 'Cancel'),
                        ]
                        : [
                            h('#edit.button.btn.btn-primary', {
                                onclick: () => {
                                    detailsModel.resetPatch();
                                    detailsModel.isEditModeEnabled = true;
                                },
                            }, 'Edit QC Flag Type'),
                        ],
                ])),
            ]),
        ]),
        h('.flex-row.w-100', [h('.w-40.ph1', qcFlagTypeDetailsList(detailsModel, qcFlagType))]),
    ],
});
