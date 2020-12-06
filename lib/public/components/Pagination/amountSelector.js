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
import { iconCaretBottom } from '/js/src/icons.js';

/**
 * Based on controllers limits
 */
const PER_PAGE_LIMITS = {
    min: 1,
    max: 100,
};

/**
 * Validate if given amount is in per page limits bounds
 * @see PER_PAGE_LIMITS
 * @param {number} amount Per page amount
 * @returns {boolean} The validity of given amount
 */
function isPerPageAmountValid(amount) {
    return amount >= PER_PAGE_LIMITS.min && amount <= PER_PAGE_LIMITS.max;
}

/**
 * Amount input component
 * @param {Function} onblur The method to be triggered when an input is blurred
 * @param {Object} model Providing page model to save custom per page value in it
 * @returns {vnode} The view of input
 */
const perPageAmountInputComponent = (onblur, model) => h('input[type=number][placeholder=Custom]', {
    style: { marginBottom: '4px' },
    class: `form-control ${!isPerPageAmountValid(model.customPerPage) && 'border-danger danger'}`,
    title: `from ${PER_PAGE_LIMITS.min} to ${PER_PAGE_LIMITS.max}`,
    max: PER_PAGE_LIMITS.max,
    min: PER_PAGE_LIMITS.min,
    oninput: ({ target }) => {
        model.setCustomPerPage(target.value);
        model.notify();
    },
    onblur: ({ target }) => isPerPageAmountValid(target.value) && onblur(target.value),
});

/**
 * Returns a collection of buttons for the available amounts within the dropdown
 * @param {Function} onclick The method to be triggered when an item is clicked
 * @param {Array} amounts The numerical options available
 * @param {Object} model Providing page model for perPageAmountInputComponent
 * @return {Array} The individual items in the dropdown
 */
const mapAmounts = (onclick, amounts, model) => [
    ...amounts.map((amount) => h('.menu-item', { onclick: () => onclick(amount) }, amount)),
    h('.menu-item', {
        onclick: () => onclick(Infinity),
        title: 'Not recommended for huge amounts of rows (>1000)',
    }, 'Infinite'),
    h('.ph3', perPageAmountInputComponent(onclick, model)),
];

/**
 * Returns the amount selector dropdown
 * @param {Function} onclickDropdown The method to be triggered when the dropdown is clicked
 * @param {Function} onclickAmount The method to be triggered when an item in the dropdown is clicked
 * @param {Boolean} dropdownVisible Whether the dropdown menu is expanded or not
 * @param {Array} amounts The numerical options available in the dropdown menu
 * @param {Number} itemsPerPage The currently set amount of items per page for pagination
 * @param {Object} model Providing page model for perPageAmountInputComponent
 * @return {vnode} The full dropdown including all options and a display of currently set amount
 */
const amountSelector = (onclickDropdown, onclickAmount, dropdownVisible, amounts, itemsPerPage, model) =>
    h(`.dropdown${dropdownVisible ? '.dropdown-open' : ''}#amountSelector`, [
        h('button.btn', { onclick: onclickDropdown }, `Rows per page: ${model.infiniteScrollEnabled ?
            'Infinite' : itemsPerPage} `, iconCaretBottom()),
        h('.dropdown-menu', mapAmounts(onclickAmount, amounts, model)),
    ]);

export default amountSelector;
