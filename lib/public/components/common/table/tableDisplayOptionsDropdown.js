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

import { h, iconCog } from '/js/src/index.js';
import { dropdown } from '../popover/dropdown.js';

/**
 * Get table display options
 * @param {OverviewPageModel} model overview page model
 * @return {Component} options dropdown
 */
export const tableDisplayOptionsDropdown = (model) => dropdown(
    h('.clickable', iconCog()),
    h('.form-check.flex-row.items-center.p1.m1', [
        h('input.form-check-input', {
            id: 'xScrollCheck',
            type: 'checkbox',
            checked: model.xDisplayScrollable,
            // eslint-disable-next-line no-return-assign
            onchange: () => model.xDisplayScrollable = !model.xDisplayScrollable,
        }),
        h('label.form-check-label', {
            for: 'xScrollCheck',
        }, 'Table horizontall scroll'),
    ]),
);
