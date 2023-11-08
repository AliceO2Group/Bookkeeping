/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { h } from '/js/src/index.js';
import { RCT } from '../../../config.js';
import { rowDisplayStyle } from '../../../utils/dataProcessing/dataProcessingUtils.js';

export default function periodsTableRow(periodData, navigation, periodsModel) {
    const pageName = RCT.pageNames.periods;

    const dataCells = periodsModel.visibleFields.map((field, index) =>
        h(`td.${pageName}-${field.name}-cell.text-ellipsis`,
            periodData[field.name]
                ? periodsModel.visibleFields[index].format(navigation, periodData)
                : ''));

    const checkbox = h('td.relative.track',
        h(`input.checkbox.abs-center${periodData.selected ? '.ticked' : ''}`, {
            type: 'checkbox',
            checked: periodData.selected,
            onclick: () => {
                periodsModel.toggleSelection(periodData);
            },
        }));

    return h(`tr.track${rowDisplayStyle(periodData.selected, periodsModel.shouldHideSelectedRows)}`,
        checkbox,
        dataCells);
}
