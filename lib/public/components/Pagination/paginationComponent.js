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
import { amountSelector, pageSelector } from './index.js';

let currentScrollPosition = 0;
let ticking = false;

/**
 * Switcher of pages
 * @param {number} scrollPos Throttled scroll position of document
 * @param {function} nextPageHandler Function called when switching to a new page with its index as argument
 * @returns {void}
 */
function onScroll(scrollPos, nextPageHandler) {
    const trHeight = document.querySelector('tr').clientHeight;
    // When the height of 5 rows left, retrieve rows from the next page
    if (scrollPos + document.documentElement.clientHeight >= document.documentElement.scrollHeight - trHeight * 5) {
        nextPageHandler();
    }
}

/**
 * Returns a pagination component, including the amount selector and the pages list
 *
 * @param {PaginationModel} pagination the pagination's model
 * @returns {vnode} the component
 */
export const paginationComponent = (pagination) => {
    if (!pagination.pagesCount) {
        return null;
    }

    const { currentPage, pagesCount, isInfiniteScrollEnabled } = pagination;

    /**
     * Handler of scroll events for the infinite scroll functionality
     * @returns {void}
     */
    const scrollListener = () => {
        // If reached last page, stop listening scroll events
        if (currentPage >= pagesCount || !isInfiniteScrollEnabled) {
            return;
        }
        currentScrollPosition = window.scrollY;

        // Implementing throttling to optimize performance
        if (!ticking) {
            setTimeout(() => {
                onScroll(currentScrollPosition, pagination.goToNextPage.bind(pagination));
                ticking = false;
            }, 200);

            ticking = true;
        }
    };
    // Trigger scroll once if the component has been loaded in infinite mode and the current scroll need more elements
    scrollListener();

    return h(
        '.flex-row.justify-between.pv3',
        {
            // eslint-disable-next-line require-jsdoc
            oncreate: function () {
                this.oldScrollListener = scrollListener;
                if (isInfiniteScrollEnabled) {
                    window.addEventListener('scroll', scrollListener);
                }
            },
            // eslint-disable-next-line require-jsdoc
            onupdate: function () {
                window.removeEventListener('scroll', this.oldScrollListener);
                this.oldScrollListener = scrollListener;
                if (isInfiniteScrollEnabled) {
                    window.addEventListener('scroll', scrollListener);
                }
            },
            // eslint-disable-next-line require-jsdoc
            onremove: function () {
                window.removeEventListener('scroll', this.oldScrollListener);
            },
        },
        [
            h('.w-15', amountSelector(pagination)),
            !isInfiniteScrollEnabled && pageSelector(
                currentPage,
                pagesCount,
                (page) => {
                    pagination.currentPage = page;
                },
            ),
            h('.w-15'),
        ],
    );
};
