/**
 * @license
 * Copyright CERN and copyright holders of ALICE Trg. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-Trg.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import radiobutton from '../../common/form/inputs/RadioButton.js';
import { h } from '/js/src/index.js';

/**
 * Filter panel for DCS toggle; ON/OFF/ANY
 * @param {RunsOverviewModel} runModel the run model object
 * @return {vnode} Three radio buttons inline
 */
const dcsOperationRadioButtons = (runModel) => {
    const state = runModel.getDcsFilterOperation();
    const name = 'dcsFilterRadio';
    const label1 = 'ANY';
    const label2 = 'OFF';
    const label3 = 'ON';
    return h('.form-group-header.flex-row.w-100', [
        radiobutton({
            label: label1,
            isChecked: state === '',
            action: () => runModel.removeDcs(),
            name: name,
        }),
        radiobutton({
            label: label2,
            isChecked: state === false,
            action: () => runModel.setDcsFilterOperation(false),
            name: name,
        }),
        radiobutton({
            label: label3,
            isChecked: state === true,
            action: () => runModel.setDcsFilterOperation(true),
            name: name,
        }),
    ]);
};

export default dcsOperationRadioButtons;
