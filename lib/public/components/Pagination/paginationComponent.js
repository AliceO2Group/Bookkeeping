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

    const itemsCountMessage = [
        'Rows',
        // +1 because users expect indexing to start from 1
        h('strong#firstRowIndex', pagination.firstItemOffset + 1),
        '-',
        h('strong#lastRowIndex', Math.min(pagination.firstItemOffset + pagination.itemsPerPage, pagination.itemsCount)),
    ];
    if (pagination.itemsCount) {
        itemsCountMessage.push('of', h('strong#totalRowsCount', pagination.itemsCount));
    }

    return h(
        '.flex-row.justify-between.pv3',
        {

            /**
             * Lifecycle method called when the component is created
             * @returns {void}
             * @this {vnode}
             */
            oncreate: function () {
                this.oldScrollListener = scrollListener;
                if (isInfiniteScrollEnabled) {
                    window.addEventListener('scroll', scrollListener);
                }
            },

            /**
             * Lifecycle method called when the component is updated
             * @returns {void}
             * @this {vnode}
             */
            onupdate: function () {
                window.removeEventListener('scroll', this.oldScrollListener);
                this.oldScrollListener = scrollListener;
                if (isInfiniteScrollEnabled) {
                    window.addEventListener('scroll', scrollListener);
                }
            },

            /**
             * Lifecycle method called when the component is removed from the DOM
             * @returns {void}
             * @this {vnode}
             */
            onremove: function () {
                window.removeEventListener('scroll', this.oldScrollListener);
            },
        },
        [
            h('.w-15', amountSelector(pagination)),
            !isInfiniteScrollEnabled && [
                pageSelector(
                    currentPage,
                    pagesCount,
                    (page) => {
                        pagination.currentPage = page;
                    },
                ),
                h('.gray-darker.flex-row.g1', itemsCountMessage),
            ],
        ],
    );
};
