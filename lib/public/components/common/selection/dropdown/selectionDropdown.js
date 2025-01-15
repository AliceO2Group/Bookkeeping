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

import { h, Observable } from '/js/src/index.js';
import spinner from '../../spinner.js';
import { cleanPrefix } from '../../../../utilities/cleanPrefix.js';
import { dropdown } from '../../popover/dropdown.js';
import { filterSelectionOptions } from '../filterSelectionOptions.js';

/**
 * Display the dropdown options component containing the search input ahd the available options
 *
 * @param {SelectionModel} selectionModel the selection model
 * @param {string} filter eventual filter used to show only a subset of options
 * @param {string} selectorPrefix the prefix used to generate DOM selectors
 * @return {Component} the dropdown options component
 */
const filteredDropdownOptions = (selectionModel, filter, selectorPrefix) => {
    /**
     * Display a given option
     *
     * @param {SelectionOption} option the option to display
     * @param {string} [selectorPrefix] prefix used to generate DOM selectors for the component
     * @return {Component} the option's view
     */
    const displayOption = (option, selectorPrefix) => {
        const selector = option.selector ?? option.value;

        return h(
            'label.dropdown-option.form-check-label.flex-row.g2.ph2.pv1',
            { key: selector },
            [
                h(
                    `input#${selectorPrefix}dropdown-option-${selector}`,
                    {
                        type: selectionModel.multiple || selectionModel.allowEmpty ? 'checkbox' : 'radio',
                        name: `${selectorPrefix}dropdown-option-${selectionModel.multiple ? selector : 'group'}`,
                        checked: selectionModel.isSelected(option),
                        onchange: (e) => e.target.checked ? selectionModel.select(option) : selectionModel.deselect(option),
                    },
                ),
                option.label || option.value,
            ],
        );
    };

    /**
     * Displays the list of available options
     *
     * @param {SelectionOption[]} availableOptions the list of all the available options
     * @return {Component} the options list
     */
    const optionsList = (availableOptions) => {
        if (availableOptions.length === 0) {
            return h('.ph2.pv1', h('em', 'No options'));
        }

        return availableOptions.map((option) => displayOption(
            option,
            selectorPrefix,
        ));
    };

    return h('.dropdown-options', optionsList(filterSelectionOptions(selectionModel.options, filter)));
};

/**
 * Display a selection component composed of a view of current selection plus a dropdown displaying available options
 *
 * @param {SelectionDropdownModel} selectionDropdownModel the model storing the state of the dropdown
 * @param {Object} [configuration] the component's configuration
 * @param {string} [configuration.selectorPrefix=''] a selector prefix used to generate DOM selectors
 * @param {Component} [configuration.placeholder='-'] component used as trigger content when no option are selected
 * @param {boolean} [configuration.searchEnabled] if true, options' search input is enabled
 * @return {Component} the dropdown component
 */
export const selectionDropdown = (selectionDropdownModel, configuration) => {
    const { searchEnabled = true, placeholder = '-' } = configuration || {};
    const selectorPrefix = cleanPrefix(configuration.selectorPrefix);

    /**
     * Display a selection item
     *
     * @param {SelectionOption} option the selected option to display
     * @return {Component} the item's view
     */
    const displaySelectionItem = ({ label, value }) => h('small.badge.bg-gray-light', { key: value }, label || value);

    // Create an observable notified any time the dropdown is opened
    const openingObservable = new Observable();

    return dropdown(
        h(
            '.dropdown-trigger.form-control',
            [
                h('.flex-grow', selectionDropdownModel.selectionModel.match({
                    NotAsked: () => null,
                    Loading: () => spinner({ size: 1, absolute: false }),
                    Success: (selectionModel) => h(
                        '.flex-row.flex-wrap.dropdown-selection.g2',
                        selectionModel.selectedOptions.length > 0
                            ? selectionModel.selectedOptions.map(displaySelectionItem)
                            : h('small.badge', placeholder),
                    ),
                    Failure: () => null,
                })),
                h('.dropdown-trigger-symbol', ''),
            ],
        ),
        [
            searchEnabled && h(
                '.dropdown-head.p1',
                h(
                    `input.form-control.dropdown-search#${selectorPrefix}dropdown-search-input`,
                    {
                        type: 'search',
                        placeHolder: 'Search',
                        value: selectionDropdownModel.searchInputContent,
                        oninput: (e) => {
                            selectionDropdownModel.searchInputContent = e.target.value;
                        },
                        // eslint-disable-next-line require-jsdoc
                        oncreate: function ({ dom }) {
                            this.onOpen = () => dom.focus();
                            openingObservable.observe(this.onOpen);
                        },
                        // eslint-disable-next-line require-jsdoc
                        onupdate: function ({ dom }) {
                            openingObservable.unobserve(this.onOpen);
                            this.onOpen = () => dom.focus();
                            openingObservable.observe(this.onOpen);
                        },
                        // eslint-disable-next-line require-jsdoc
                        onremove: function () {
                            openingObservable.unobserve(this.onOpen);
                            delete this.onOpen;
                        },
                    },
                ),
            ),
            selectionDropdownModel.selectionModel.match({
                NotAsked: () => null,
                Loading: () => spinner({ size: 2, absolute: false }),
                Success: (selectionModel) => filteredDropdownOptions(selectionModel, selectionDropdownModel.searchInputContent, selectorPrefix),
                Failure: () => null,
            }),
        ],
        {
            selectorPrefix,
            onVisibilityChange: (visibility) => {
                if (visibility) {
                    openingObservable.notify();
                }
            },
        },
    );
};
