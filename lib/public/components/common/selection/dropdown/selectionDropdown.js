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

import { h, RemoteData } from '/js/src/index.js';
import spinner from '../../spinner.js';
import { cleanPrefix } from '../../../../utilities/cleanPrefix.js';
import { dropdown } from '../../popover/dropdown.js';

/**
 * @callback DisplayDropdownOption
 *
 * @param {SelectionOption} option the option to display
 * @param {boolean} checked the current state of the option
 * @param {function} onChange function called with the option and its new state when the option's state change
 * @param {string} [selectorPrefix] prefix used to generate DOM selectors for the component
 * @return {Component} the option's view
 */

/**
 * @callback DisplaySelectionItem
 *
 * @param {SelectionOption} option the selected option to display
 * @return {Component} the item's view
 */

/**
 * Display the dropdown options component containing the search input ahd the available options
 *
 * @param {SelectionDropdownModel} dropdownModel the dropdown model
 * @param {string} selectorPrefix the prefix used to generate DOM selectors
 * @param {DisplayDropdownOption} displayOption function used to display a given option
 * @return {Component} the dropdown options component
 */
const dropdownOptions = (dropdownModel, selectorPrefix, displayOption) => {
    // eslint-disable-next-line require-jsdoc
    const onSelectionChange = (option, state) => {
        state ? dropdownModel.select(option) : dropdownModel.deselect(option);
    };

    /**
     * Displays the list of available options
     *
     * @param {SelectionOption[]} availableOptions the list of all the available options
     * @param {function} onChange callback to handle an option state change
     * @return {Component} the options list
     */
    const optionsList = (availableOptions, onChange) => {
        if (availableOptions.length === 0) {
            return h('.ph2.pv1', h('em', 'No options'));
        }

        return availableOptions.map((option) => displayOption(
            option,
            dropdownModel.isSelected(option),
            onChange,
            selectorPrefix,
        ));
    };

    return [
        h(
            '.dropdown-head.p1',
            h(
                `input.form-control.dropdown-search#${selectorPrefix}dropdown-search-input`,
                {
                    type: 'search',
                    placeHolder: 'Search',
                    value: dropdownModel.searchInputContent,
                    oninput: (e) => {
                        dropdownModel.searchInputContent = e.target.value;
                    },
                    oncreate: (vnode) => {
                        vnode.dom.focus();
                    },
                },
            ),
        ),
        h('.dropdown-options', dropdownModel.options instanceof RemoteData
            ? dropdownModel.options.match({
                NotAsked: () => null,
                Loading: () => spinner({ size: 2, absolute: false }),
                Success: (availableOptions) => optionsList(availableOptions, onSelectionChange),
                Failure: () => null,
            })
            : optionsList(dropdownModel.options, onSelectionChange)),
    ];
};

/**
 * Display a selection component composed of a view of current selection plus a dropdown displaying available options
 *
 * @param {SelectionDropdownModel} selectionDropdownModel the model storing the state of the dropdown
 * @param {Object} [configuration] the component's configuration
 * @param {string} [configuration.selectorPrefix=''] a selector prefix used to generate DOM selectors
 * @param {DisplayDropdownOption} [configuration.displayOption=null] function used to generate the option's view
 * @param {DisplaySelectionItem} [configuration.displaySelectionItem=null] function called with the selected option to generate the current
 *     selection's items
 * @param {"left"|"right"} [configuration.alignment='left'] defines the alignment of the dropdown
 * @return {Component} the dropdown component
 */
export const selectionDropdown = (selectionDropdownModel, configuration) => {
    let { displayOption = null, displaySelectionItem = null } = configuration || {};
    const selectorPrefix = cleanPrefix(configuration.selectorPrefix);

    if (displayOption === null) {
        displayOption = (option, checked, onChange, selectorPrefix) => h(
            'label.dropdown-option.form-check-label.flex-row.g2.ph2.pv1',
            [
                h(
                    `input#${selectorPrefix}dropdown-option-${option.value}`,
                    {
                        type: 'checkbox',
                        checked,
                        onchange: (e) => onChange(option, e.target.checked),
                    },
                ),
                option.label || option.value,
            ],
        );
    }

    if (displaySelectionItem === null) {
        displaySelectionItem = ({ label, value }) => h('small.badge.bg-gray-light', label || value);
    }

    const selectedPills = h(
        '.flex-row.flex-wrap.dropdown-selection.g2',
        selectionDropdownModel.selectedOptions.length > 0
            ? selectionDropdownModel.selectedOptions.map(displaySelectionItem)
            : h('small.badge', '-'),
    );

    return dropdown(
        selectionDropdownModel.toggleModel,
        selectedPills,
        dropdownOptions(selectionDropdownModel, selectorPrefix, displayOption),
        { selectorPrefix, alignment: configuration.alignment },
    );
};
