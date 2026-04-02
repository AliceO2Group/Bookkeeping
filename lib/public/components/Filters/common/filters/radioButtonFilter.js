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

import { radioButton } from '../../../common/form/inputs/radioButton.js';
import { h } from '/js/src/index.js';

/**
 * Radiobutton filter component
 *
 * @param {RadioSelectionModel} selectionModel the a selectionmodel
 * @param {string} filterName the name of the filter
 * @return {vnode} A number of radiobuttons corresponding with the selection options
 */
const radioButtonFilter = (selectionModel, filterName) => {
    const name = `${filterName}FilterRadio`;
    return h(
        '.form-group-header.flex-row.w-100',
        selectionModel.options.map((option) => {
            const { label } = option;
            const action = () => selectionModel.select(option);
            const isChecked = selectionModel.isSelected(option);

            return radioButton({ label, isChecked, action, name });
        }),
    );
};

export default radioButtonFilter;
