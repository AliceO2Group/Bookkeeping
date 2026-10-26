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

import { h } from '/js/src/index.js';
import { selectionDropdown } from '../../../components/common/selection/dropdown/selectionDropdown.js';
import { formatBeamTypeBadge } from './formatBeamTypeBadge.js';

/**
 * Display the dropdown selecting beam types, whose options and selected items are displayed as the beam types are in the tables
 *
 * @param {SelectionDropdownModel} beamTypesSelectionModel the model storing the state of the dropdown
 * @return {Component} the dropdown
 */
export const beamTypeSelectionDropdown = (beamTypesSelectionModel) => selectionDropdown(beamTypesSelectionModel, {
    selectorPrefix: 'beam-types',

    /**
     * Display an option of the dropdown, with the same selectors as the default display
     *
     * @param {SelectionOption} option the option to display
     * @param {boolean} checked true if the option is selected
     * @param {Function} onChange function called with the option and its new state when it changes
     * @param {string} selectorPrefix the prefix of the DOM selectors
     * @return {Component} the option
     */
    displayOption: (option, checked, onChange, selectorPrefix) => {
        const key = option.selector ?? option.value;
        return h('label.dropdown-option.form-check-label.flex-row.g2.ph2.pv1', { key }, [
            h(`input#${selectorPrefix}dropdown-option-${key}`, {
                type: 'checkbox',
                name: `${selectorPrefix}dropdown-option-${key}`,
                checked,
                onchange: (e) => onChange(option, e.target.checked),
            }),
            formatBeamTypeBadge(option.label || option.value),
        ]);
    },
    displaySelectionItem: ({ label, value }) => h('', { key: value }, formatBeamTypeBadge(label || value)),
});
