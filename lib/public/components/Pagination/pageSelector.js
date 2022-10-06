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
 * @param {Number} currentPage Index of the current page
 * @param {Function} onPageChange Function called when switching to a new page with its index as argument
 * @return {Array} A collection of vnodes containing the individual page buttons
 */
const getPageButtons = (pages, currentPage, onPageChange) => pages.map((page) => h(
    `button.btn.btn-tab.mh1${page === currentPage ? ' selected' : ''}#page${page}`,
    { onclick: () => onPageChange(page) },
    page,
));

/**
 * Render the page selector component
 *
 * @param {number} currentPage The current active page
 * @param {number} pagesCount The total amount of pages available
 * @param {function} onPageChange callback called when the selected page change with the new page as argument
 * @return {Component} The full button group containing navigation arrows and the (shortened) page buttons themselves
 */
const pageSelector = (currentPage, pagesCount, onPageChange) => {
    const pages = [...Array(pagesCount + 1).keys()].slice(1);

    let pageButtons;
    if (pagesCount <= MAX_VISIBLE_PAGES) {
        pageButtons = getPageButtons(pages, currentPage, onPageChange);
    } else {
        const frontBound = Math.min(Math.max(0, currentPage - MAX_VISIBLE_PAGES + 2), pagesCount - MAX_VISIBLE_PAGES);
        const rearBound = Math.min(Math.max(MAX_VISIBLE_PAGES, currentPage + MAX_VISIBLE_PAGES - 3), pagesCount);
        pageButtons = getPageButtons(pages.slice(frontBound, rearBound), currentPage, onPageChange);
    }
    return h(
        '.btn-group#pageSelector',
        [
            h('button.btn.mh1#pageMoveLeft', {
                onclick: () => onPageChange(currentPage - 1),
                disabled: currentPage === 1,
            }, iconArrowThickLeft()),
            ...pageButtons,
            h('button.btn.mh1#pageMoveRight', {
                onclick: () => onPageChange(currentPage + 1),
                disabled: currentPage === pagesCount,
            }, iconArrowThickRight()),
        ],
    );
};

export default pageSelector;
