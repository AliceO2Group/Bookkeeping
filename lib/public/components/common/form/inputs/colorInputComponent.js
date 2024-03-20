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

import { h, iconX } from '@aliceo2/web-ui/Frontend/js/src/index.js';

/**
 * Returns a create button component
 *
 * @param {string} color The current color go
 * @param {function} onInput The function of what must happen on input
 * @return {Component} The color input element
 */
export const colorInputComponent = (color, onInput) => h('.flex-row.items-center.g2', [
    h('input#color', {
        type: 'color',
        value: color,
        oninput: (e) => onInput(e.target.value ?? null),
    }),
    h(
        '.btn.btn-pill.f7',
        { disabled: !color, onclick: () => onInput(null), title: 'Reset color selection' },
        iconX(),
    ),
]);
