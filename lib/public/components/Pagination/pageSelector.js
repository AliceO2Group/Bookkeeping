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
 * @param {Function} onclick Function that initiates page switching
 * @param {number} selectedPage Number of current page
 * @returns {void}
 */
function switchPage(scrollPos, onclick, selectedPage) {
    const trHeight = document.querySelector('tr').clientHeight;
    // When the height of 5 rows left, retrieve rows from the next page
    if (scrollPos + document.documentElement.clientHeight >= document.documentElement.scrollHeight - trHeight * 5) {
        onclick(selectedPage + 1);
    }
}

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
 * @param {Function} onclick The function to be triggered when any page number is clicked
 * @param {Object} model Model of related entity
 * @return {vnode | null} The full button group containing navigation arrows and the (shortened) page buttons themselves
 */
const pageSelector = (onclick, model) => {
    const pageCount = model.getTotalPages();

    /**
     * Handler of scroll events for the infinite scroll functionality
     * @returns {void}
     */
    const scrollListener = () => {
        // If reached last page, stop listening scroll events
        if (model.getSelectedPage() >= pageCount || !model.isInfiniteScrollEnabled()) {
            window.onscroll = null;
            return;
        }
        currentScrollPosition = window.scrollY;

        // Implementing throttling to optimize performance
        if (!ticking) {
            setTimeout(() => {
                switchPage(currentScrollPosition, onclick, model.getSelectedPage());
                ticking = false;
            }, 200);

            ticking = true;
        }
    };

    if (model.isInfiniteScrollEnabled()) {
        window.onscroll = scrollListener;
    }

    if (pageCount <= 1 || model.isInfiniteScrollEnabled()) {
        return null;
    }

    const pages = [...Array(pageCount + 1).keys()].slice(1);

    let pageButtons;
    if (pageCount <= MAX_VISIBLE_PAGES) {
        pageButtons = getPageButtons(pages, model.getSelectedPage(), onclick);
    } else {
        const frontBound =
            Math.min(Math.max(0, model.getSelectedPage() - MAX_VISIBLE_PAGES + 2), pageCount - MAX_VISIBLE_PAGES);
        const rearBound =
            Math.min(Math.max(MAX_VISIBLE_PAGES, model.getSelectedPage() + MAX_VISIBLE_PAGES - 3), pageCount);
        pageButtons = getPageButtons(pages.slice(frontBound, rearBound), model.getSelectedPage(), onclick);
    }

    return h('.btn-group#pageSelector', [
        h('button.btn.mh1#pageMoveLeft', {
            onclick: () => onclick(model.getSelectedPage() - 1),
            disabled: model.getSelectedPage() === 1,
        }, iconArrowThickLeft()),
        ...pageButtons,
        h('button.btn.mh1#pageMoveRight', {
            onclick: () => onclick(model.getSelectedPage() + 1),
            disabled: model.getSelectedPage() === pageCount,
        }, iconArrowThickRight()),
    ]);
};

export default pageSelector;
