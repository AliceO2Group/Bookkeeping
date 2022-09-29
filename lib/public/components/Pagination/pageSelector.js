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
let currentScrollPosition = 0;
let ticking = false;

/**
 * Switcher of pages
 * @param {number} scrollPos Throttled scroll position of document
 * @param {function} onPageChange Function called when switching to a new page with its index as argument
 * @param {number} currentPage Index of the current page
 * @returns {void}
 */
function switchPage(scrollPos, onPageChange, currentPage) {
    const trHeight = document.querySelector('tr').clientHeight;
    // When the height of 5 rows left, retrieve rows from the next page
    if (scrollPos + document.documentElement.clientHeight >= document.documentElement.scrollHeight - trHeight * 5) {
        onPageChange(currentPage + 1);
    }
}

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
 * Render the full page selector
 * @param {PaginationModel} pagination the pagination's model
 * @return {vnode | null} The full button group containing navigation arrows and the (shortened) page buttons themselves
 */
const pageSelector = (pagination) => {
    const { currentPage, pagesCount, isInfiniteScrollEnabled } = pagination;
    // eslint-disable-next-line require-jsdoc
    const onPageChange = (page) => {
        pagination.currentPage = page;
    };

    /**
     * Handler of scroll events for the infinite scroll functionality
     * @returns {void}
     */
    const scrollListener = () => {
        // If reached last page, stop listening scroll events
        if (currentPage >= pagesCount || !isInfiniteScrollEnabled) {
            window.onscroll = null;
            return;
        }
        currentScrollPosition = window.scrollY;

        // Implementing throttling to optimize performance
        if (!ticking) {
            setTimeout(() => {
                switchPage(currentScrollPosition, onPageChange, currentPage);
                ticking = false;
            }, 200);

            ticking = true;
        }
    };

    if (isInfiniteScrollEnabled) {
        window.onscroll = scrollListener;
    }

    if (pagesCount <= 1 || isInfiniteScrollEnabled) {
        return null;
    }

    const pages = [...Array(pagesCount + 1).keys()].slice(1);

    let pageButtons;
    if (pagesCount <= MAX_VISIBLE_PAGES) {
        pageButtons = getPageButtons(pages, currentPage, onPageChange);
    } else {
        const frontBound =
            Math.min(Math.max(0, currentPage - MAX_VISIBLE_PAGES + 2), pagesCount - MAX_VISIBLE_PAGES);
        const rearBound =
            Math.min(Math.max(MAX_VISIBLE_PAGES, currentPage + MAX_VISIBLE_PAGES - 3), pagesCount);
        pageButtons = getPageButtons(pages.slice(frontBound, rearBound), currentPage, onPageChange);
    }
    return h('.btn-group#pageSelector', [
        h('button.btn.mh1#pageMoveLeft', {
            onclick: () => onPageChange(currentPage - 1),
            disabled: currentPage === 1,
        }, iconArrowThickLeft()),
        ...pageButtons,
        h('button.btn.mh1#pageMoveRight', {
            onclick: () => onPageChange(currentPage + 1),
            disabled: currentPage === pagesCount,
        }, iconArrowThickRight()),
    ]);
};

export default pageSelector;
