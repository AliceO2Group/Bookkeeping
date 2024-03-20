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
import { eosReportCreationComponent } from './eosReportCreationComponent.js';
import { h } from '/js/src/index.js';
import { SHIFT_TYPES } from '../../../domain/enums/ShiftTypes.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';

/**
 * Returns the EOS report creation page
 *
 * @param {Model} model the global model
 * @return {Component} the EOS report creation page
 */
export const EosReportCreationPage = (model) => {
    const { creationModel } = model.eosReportModel;

    if (creationModel) {
        return eosReportCreationComponent(creationModel);
    } else {
        return [
            h('h1', 'Shift type'),
            h(
                '.flex-row.g3',
                SHIFT_TYPES.map((shiftType) => frontLink(shiftType, 'eos-report-create', { shiftType }, { class: 'btn btn-primary' })),
            ),
        ];
    }
};
