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

export default function periodsTableHeader(periodsModel, pageName, data) {
    const headerColumns = (visibleFields) => {
        const dataHeaders = visibleFields.map((field, index) =>
            h(`th.${pageName}-${field.name}-header`, {
                scope: 'col',
            }, h('.relative', h('.inline', visibleFields[index].header))));
        return dataHeaders;
    };

    const headerCheckbox = (model, data) =>
        h('th', { scope: 'col' },
            h('.relative',
                h(`input.checkbox.abs-center${data.every((r) => r.selected) ? '.ticked' : ''}`, {
                    type: 'checkbox',
                    onclick: (e) => {
                        for (const row of data) {
                            row.selected = e.target.checked;
                        }
                        model.notify();
                    },
                    checked: data.every((r) => r.selected),
                })));

    return h('thead.header',
        h('tr',
            headerCheckbox(periodsModel, data),
            headerColumns(periodsModel.visibleFields)));
}
