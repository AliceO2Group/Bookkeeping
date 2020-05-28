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
 * Returns a collection of buttons for the available amounts within the dropdown
 * @param {Function} onclick The method to be triggered when an item is clicked
 * @param {Array} amounts The numerical options available
 * @return {vnode} The individual items in the dropdown
 */
const mapAmounts = (onclick, amounts) =>
    amounts.map((amount) => h('.menu-item', { onclick: () => onclick(amount) }, amount));

/**
 * Returns the amount selector dropdown
 * @param {Function} onclickDropdown The method to be triggered when the dropdown is clicked
 * @param {Function} onclickAmount The method to be triggered when an item in the dropdown is clicked
 * @param {Boolean} dropdownVisible Whether the dropdown menu is expanded or not
 * @param {Array} amounts The numerical options available in the dropdown menu
 * @param {Number} itemsPerPage The currently set amount of items per page for pagination
 * @return {vnode} The full dropdown including all options and a display of currently set amount
 */
const amountSelector = (onclickDropdown, onclickAmount, dropdownVisible, amounts, itemsPerPage) =>
    h(`.dropdown${dropdownVisible ? '.dropdown-open' : ''}#amountSelector`, [
        h('button.btn', { onclick: onclickDropdown }, `Amount per page: ${itemsPerPage} `, iconCaretBottom()),
        h('.dropdown-menu', mapAmounts(onclickAmount, amounts)),
    ]);

export default amountSelector;
