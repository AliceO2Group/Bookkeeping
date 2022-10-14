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
import { iconCaretTop } from '/js/src/icons.js';
import { taggedEventRegistry } from '../../utilities/taggedEventRegistry.js';

/**
 * Based on controllers limits
 */
const PER_PAGE_LIMITS = {
    min: 1,
    max: 1000,
};

const AVAILABLE_AMOUNTS = [5, 10, 20];

const CLICK_ON_AMOUNT_SELECTOR_EVENT_TAG = 'click-on-amount-selector-event-tag';

/**
 * Validate if given amount is in per page limits bounds
 * @see PER_PAGE_LIMITS
 * @param {number} amount Per page amount
 * @returns {boolean} The validity of given amount
 */
const isPerPageAmountValid = (amount) => !isNaN(amount) && amount >= PER_PAGE_LIMITS.min && amount <= PER_PAGE_LIMITS.max;

/**
 * Amount input component
 * @param {Function} onCustomChoiceConfirm The method to be triggered when the custom choice is confirmed
 * @param {PaginationModel} paginationModel the pagination's model
 * @returns {vnode} The view of input
 */
const perPageAmountInputComponent = (onCustomChoiceConfirm, paginationModel) => h('input[type=number][placeholder=Custom]', {
    style: { marginBottom: '4px' },
    class: `form-control`,
    title: `from ${PER_PAGE_LIMITS.min} to ${PER_PAGE_LIMITS.max}`,
    max: PER_PAGE_LIMITS.max,
    min: PER_PAGE_LIMITS.min,
    oninput: ({ target }) => {
        paginationModel.customItemsPerPage = target.value;
    },
    onkeyup: ({ code }) => {
        if (code === 'Enter') {
            onCustomChoiceConfirm();
        }
    },
    onblur: onCustomChoiceConfirm,
});

/**
 * Returns a collection of buttons for the available amounts within the dropdown
 * @param {PaginationModel} paginationModel the pagination's model
 * @return {Array} The individual items in the dropdown
 */
const mapAmounts = (paginationModel) => {
    /**
     * Callback handling a new items per page selection
     *
     * @param {number} amount the new items per page
     * @return {void}
     */
    const setItemsPerPage = (amount) => {
        paginationModel.itemsPerPage = amount;
    };

    /**
     * Hides the amount selector
     * @return {void}
     */
    const dismissAmountSelector = () => {
        paginationModel.isAmountDropdownVisible = false;
    };

    /**
     * If it is valid, use the custom items per page
     * @return {void}
     */
    const useCustomAmount = () => {
        const itemsPerPage = parseInt(paginationModel.customItemsPerPage, 10);
        if (isPerPageAmountValid(itemsPerPage)) {
            setItemsPerPage(itemsPerPage);
        }
    };

    return [
        ...AVAILABLE_AMOUNTS.map((amount) => h(
            '.menu-item',
            { onclick: () => setItemsPerPage(amount) },
            amount,
        )),
        h('.menu-item', {
            onclick: () => paginationModel.enableInfiniteMode(),
            title: 'Not recommended for huge amounts of rows (>1000)',
        }, 'Infinite'),
        h(
            '.ph3',
            {
                oncreate: () => taggedEventRegistry.addListenerForAnyExceptTagged(dismissAmountSelector, CLICK_ON_AMOUNT_SELECTOR_EVENT_TAG),
                onremove: () => taggedEventRegistry.removeListener(dismissAmountSelector),
            },
            perPageAmountInputComponent(
                useCustomAmount,
                paginationModel,
            ),
        ),
    ];
};

/**
 * Returns the amount selector dropdown
 * @param {PaginationModel} paginationModel the pagination's model
 * @return {vnode} The full dropdown including all options and a display of currently set amount
 */
const amountSelector = (paginationModel) =>
    h('#amountSelector', {
        onclick: (e) => taggedEventRegistry.tagEvent(e, CLICK_ON_AMOUNT_SELECTOR_EVENT_TAG),
        class: [
            'dropup',
            paginationModel.isInfiniteScrollEnabled ? 'shadow-level3' : '',
            paginationModel.isAmountDropdownVisible ? 'dropup-open' : '',
        ].filter((className) => Boolean(className)).join(' '),
        style: paginationModel.isInfiniteScrollEnabled ? {
            position: 'fixed',
            bottom: '16px',
            zIndex: 100,
        } : null,
    }, [
        h(
            'button.btn',
            {
                onclick: () => {
                    paginationModel.toggleAmountDropdownVisibility();
                },
            },
            `Rows per page: ${paginationModel.isInfiniteScrollEnabled ? 'Infinite' : paginationModel.itemsPerPage} `,
            iconCaretTop(),
        ),
        h('.dropup-menu', mapAmounts(paginationModel)),
    ]);

export default amountSelector;
