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

/**
 * @callback switchInputOnChangeCallback
 * @param {boolean} value the new switch value
 * @return {void}
 */

import { h } from '/js/src/index.js';

/**
 * Render a switch input (styled checkbox)
 *
 * @param {boolean} value the current value of the switch
 * @param {switchInputOnChangeCallback} onChange function called with the new value as argument when the value change
 * @param {object} [options] eventual options for the input
 * @param {string|number} [options.key] key to apply to the switch component
 * @param {Component} [options.labelBefore] the label to display before the input
 * @param {Component} [options.labelAfter] the label to display after the input
 * @param {Component} [options.color] the background color of the slider when active
 * @return {Component} the switch component
 */
export const switchInput = (value, onChange, options) => {
    const { key, labelAfter, labelBefore, color } = options || {};
    const attributes = { ...key ? { key } : {} };

    return h(
        'label.flex-row.g1.items-center',
        attributes,
        [
            labelBefore,
            h('.switch', [
                h('input', {
                    onchange: (e) => onChange(e.target.checked),
                    type: 'checkbox',
                    checked: value,
                }),
                h('span.slider.round', { ...color && value ? { style: `background-color: ${color}` } : {} }),
            ]),
            labelAfter,
        ],
    );
};
