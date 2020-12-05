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
import { iconArrowThickLeft, iconArrowThickRight } from '/js/src/icons.js';

const MAX_VISIBLE_PAGES = 5;

/**
 * Render the page buttons
 * @param {Array} pages An array of the page numbers that require buttons
 * @param {Number} selectedPage The number of the currently selected page
 * @param {Function} onclick The function to be triggered when any page number is clicked
 * @return {Array} A collection of vnodes containing the individual page buttons
 */
const getPageButtons = (pages, selectedPage, onclick) =>
    pages.map((page) => h(`button.btn.btn-tab.mh1${page === selectedPage ? ' selected' : ''}#page${page}`, {
        onclick: () => onclick(page),
    }, page));

/**
 * Render the full page selector
 * @param {Number} pageCount The total amount of pages available to the user
 * @param {Number} selectedPage The number of the currently selected page
 * @param {Function} onclick The function to be triggered when any page number is clicked
 * @param {boolean} hidden Parameter to define if pageSelector should be hidden
 * @return {vnode} The full button group containing navigation arrows and the (shortened) page buttons themselves
 */
const pageSelector = (pageCount, selectedPage, onclick, hidden) => {
    if (pageCount <= 1 || hidden) {
        return null;
    }

    const pages = [...Array(pageCount + 1).keys()].slice(1);

    let pageButtons;
    if (pageCount <= MAX_VISIBLE_PAGES) {
        pageButtons = getPageButtons(pages, selectedPage, onclick);
    } else {
        const frontBound = Math.min(Math.max(0, selectedPage - MAX_VISIBLE_PAGES + 2), pageCount - MAX_VISIBLE_PAGES);
        const rearBound = Math.min(Math.max(MAX_VISIBLE_PAGES, selectedPage + MAX_VISIBLE_PAGES - 3), pageCount);
        pageButtons = getPageButtons(pages.slice(frontBound, rearBound), selectedPage, onclick);
    }

    return h('.btn-group#pageSelector', [
        h('button.btn.mh1#pageMoveLeft', {
            onclick: () => onclick(selectedPage - 1),
            disabled: selectedPage === 1,
        }, iconArrowThickLeft()),
        ...pageButtons,
        h('button.btn.mh1#pageMoveRight', {
            onclick: () => onclick(selectedPage + 1),
            disabled: selectedPage === pageCount,
        }, iconArrowThickRight()),
    ]);
};

export default pageSelector;
