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

import { PaginationModel } from '../../../components/Pagination/PaginationModel.js';
import { getRemoteDataSlice } from '../../../utilities/fetch/getRemoteDataSlice.js';
import { Observable, RemoteData } from '/js/src/index.js';

/**
 * Model representing handlers for log tree entries page
 *
 * @implements {OverviewModel}
 */
export class LogsOverviewTreeModel extends Observable {
    /**
     * The constructor of the Overview tree model object
     *
     */
    constructor() {
        super();

        this._pagination = new PaginationModel();
        this._pagination.observe(() => this.fetchLogs());
        this._pagination.itemsPerPageSelector$.observe(() => this.notify());

        this._logs = RemoteData.notAsked();

        this.reset(false);
    }

    /**
     * Retrieve every relevant log from the API
     * @returns {Promise<void>} Injects the data object with the response data
     */
    async fetchLogs() {
        const keepExisting = this._pagination.currentPage > 1 && this._pagination.isInfiniteScrollEnabled;

        if (!keepExisting) {
            this._logs = RemoteData.loading();
            this.notify();
        }

        const params = {
            'page[offset]': this._pagination.firstItemOffset,
            'page[limit]': this._pagination.itemsPerPage,
        };

        const endpoint = `/api/logs/root?${new URLSearchParams(params).toString()}`;

        try {
            const { items, totalCount } = await getRemoteDataSlice(endpoint);
            const transformedItems = items.map((log) => ({
                log,
                children: RemoteData.notAsked(),
                open: false,
            }));
            const concatenateWith = keepExisting ? this._logs.match({
                Success: (logs) => logs,
                Other: () => [],
            }) : [];
            this._logs = RemoteData.success([...concatenateWith, ...transformedItems]);
            this._pagination.itemsCount = totalCount;
        } catch (errors) {
            this._logs = RemoteData.failure(errors);
        }

        this.notify();
    }

    /**
     * Retrieve every relevant child log of the given parent from the API
     * @param {Log} parentLogNode The parent log
     * @returns {Promise<void>} Injects the data object with the response data
     */
    async fetchReplies(parentLogNode) {
        const { log: parentLog, open: open } = parentLogNode;

        if (parentLog.replies === 0) {
            return;
        }

        parentLogNode.children = RemoteData.loading();
        this.notify();
        const endpoint = `/api/logs/${parentLog.id}/children`;

        try {
            if (open) {
                parentLogNode.children = RemoteData.notAsked();
                parentLogNode.open = false;
                this.notify();
                return;
            } else {
                const { items: logs } = await getRemoteDataSlice(endpoint);
                parentLogNode.children = RemoteData.success(logs.map((log) => ({
                    log,
                    children: RemoteData.notAsked(),
                })));
                parentLogNode.open = true;
            }
        } catch (errors) {
            parentLogNode.children = RemoteData.failure(errors);
        }

        this.notify();
    }

    /**
     * Return current logs
     * @return {RemoteData<*[]>} current data
     */
    get logs() {
        return this._logs;
    }

    /**
     * Reset all filtering, sorting and pagination settings to their default values
     *
     * @param {boolean} fetch Whether to refetch all logs after filters have been reset
     * @return {undefined}
     */
    reset(fetch = true) {
        this._pagination.reset();

        if (fetch) {
            this.fetchLogs();
        }
    }

    /**
     * Returns the pagination model
     *
     * @return {PaginationModel} the pagination model
     */
    get pagination() {
        return this._pagination;
    }

    /**
     * Apply the current filtering and update the remote data list
     *
     * @param {boolean} now if true, filtering will be applied now without debouncing
     *
     * @return {void}
     */
    _applyFilters(now = false) {
        this._pagination.silentlySetCurrentPage(1);
        now ? this.fetchLogs() : this._debouncedFetchAllLogs();
    }
}
