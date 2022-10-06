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
import { Observable } from '/js/src/index.js';

const DEFAULT_ITEMS_PER_PAGE = 10;
const DEFAULT_CURRENT_PAGE = 1;
const DEFAULT_TOTAL_PAGES_COUNT = 1;

export const INFINITE_SCROLL_CHUNK_SIZE = 19;

/**
 * Model to handle pagination
 */
export class PaginationModel extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();

        // Fallback value that will be used if items per page is not defined
        this._defaultItemsPerPage = null;
        this._itemsPerPage = null;
        // Set the custom items per page to a valid value
        this._customItemsPerPage = DEFAULT_ITEMS_PER_PAGE;
        this._currentPage = DEFAULT_CURRENT_PAGE;
        this._pagesCount = DEFAULT_TOTAL_PAGES_COUNT;

        this._itemsPerPageSelector$ = new Observable();
    }

    /**
     * Reset the pagination to its default values
     *
     * @return {void}
     */
    reset() {
        this._itemsPerPage = null;
        this._defaultItemsPerPage = null;
        this._customItemsPerPage = DEFAULT_ITEMS_PER_PAGE;
        this._currentPage = DEFAULT_CURRENT_PAGE;
        this._pagesCount = DEFAULT_TOTAL_PAGES_COUNT;
    }

    /**
     * Define the default items per page to use if there is not one already defined
     *
     * @param {number} defaultItemsPerPage the value to use as default items per page if none has been defined yet
     *
     * @return {void}
     */
    provideDefaultItemsPerPage(defaultItemsPerPage) {
        if (defaultItemsPerPage !== this._defaultItemsPerPage) {
            this._defaultItemsPerPage = defaultItemsPerPage;
            this.notify();
        }
    }

    /**
     * Defines the current page without notifying observers
     *
     * @param {number} page the current page
     * @return {boolean} true if the page actually changed, else false
     */
    silentlySetCurrentPage(page) {
        if (this._currentPage !== page) {
            this._currentPage = page;
            return true;
        }
        return false;
    }

    /**
     * If the current page is not the last one, navigate to the next one
     *
     * @return {void}
     */
    goToNextPage() {
        if (this._currentPage < this._pagesCount) {
            this.currentPage = this.currentPage + 1;
        }
    }

    /**
     * Returns the current page
     *
     * @return {number} the current page
     */
    get currentPage() {
        return this._currentPage;
    }

    /**
     * Defines the current page and notify the change to observers
     *
     * @param {number} page the current page
     */
    set currentPage(page) {
        if (this.silentlySetCurrentPage(page)) {
            this.notify();
        }
    }

    /**
     * Returns the amount of items displayed per page
     *
     * @return {number} the amount of items per page
     */
    get itemsPerPage() {
        return this._itemsPerPage || this._defaultItemsPerPage || DEFAULT_ITEMS_PER_PAGE;
    }

    /**
     * Defines the amount of items displayed per page
     *
     * @param {number} amount the amount of items
     */
    set itemsPerPage(amount) {
        if (this._itemsPerPage !== amount) {
            this._itemsPerPage = amount;
            this._currentPage = DEFAULT_CURRENT_PAGE;
        }
        this._isAmountDropdownVisible = false;

        this.notify();
    }

    /**
     * Returns the amount of items per page defined by the user as free choice
     *
     * @return {number} the custom items per page
     */
    get customItemsPerPage() {
        return this._customItemsPerPage;
    }

    /**
     * Defines the amount of items per page defined by the user as free choice
     *
     * @param {number} customItemsPerPage the custom items per page
     *
     * @return {void}
     */
    set customItemsPerPage(customItemsPerPage) {
        this._customItemsPerPage = customItemsPerPage;
        this._itemsPerPageSelector$.notify();
    }

    /**
     * Returns the total amount of pages available
     *
     * @return {number} the available pages count
     */
    get pagesCount() {
        return this._pagesCount;
    }

    /**
     * Defines the total amount of pages available
     *
     * @param {number} pagesCount the amount of pages available
     */
    set pagesCount(pagesCount) {
        this._pagesCount = pagesCount;
    }

    /**
     * States if the infinite scroll mode is enabled
     *
     * @return {boolean} true if infinite scroll mode is enabled
     */
    get isInfiniteScrollEnabled() {
        return this.itemsPerPage === Infinity;
    }

    /**
     * Toggles amount dropdown visibility
     *
     * @return {void}
     */
    toggleAmountDropdownVisibility() {
        this.isAmountDropdownVisible = !this.isAmountDropdownVisible;
    }

    /**
     * States if the amount dropdown is visible or not
     *
     * @return {boolean} true if the dropdown is visible
     */
    get isAmountDropdownVisible() {
        return this._isAmountDropdownVisible;
    }

    /**
     * Defines if the amount dropdown is visible
     *
     * @param {boolean} visible true to display the dropdown, else false
     */
    set isAmountDropdownVisible(visible) {
        this._isAmountDropdownVisible = visible;
        this._itemsPerPageSelector$.notify();
    }

    /**
     * Observable notified when the item per page selector change (either a custom value is typed, or its visibility change)
     *
     * @return {Observable} the selector observable
     */
    get itemsPerPageSelector$() {
        return this._itemsPerPageSelector$;
    }
}
