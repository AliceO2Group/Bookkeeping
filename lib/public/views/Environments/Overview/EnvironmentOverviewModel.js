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
import { Observable, RemoteData } from '/js/src/index.js';
import { getRemoteDataSlice } from '../../../utilities/fetch/getRemoteDataSlice.js';
import { PassThroughColumnmodel } from '../../../components/common/newTable/columnModels/passThroughColumnModel.js';

/**
 * Environment overview page model
 */
export class EnvironmentOverviewModel extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();

        this._pagination = new PaginationModel();
        this._pagination.observe(() => this.fetchAllEnvs());
        this._pagination.itemsPerPageSelector$.observe(() => this.notify());

        this._environments = RemoteData.NotAsked();

        this._environmentTableModel = new EnvironmentTableModel();
    }

    /**
     * Retrieve every relevant environment from the API
     *
     * @returns {undefined} Inject the data object with the response data
     */
    async fetchAllEnvs() {
        const concatenateWith = this._pagination.currentPage > 1 && this._pagination.isInfiniteScrollEnabled
            ? this._environments.payload || []
            : [];

        if (!this._pagination.isInfiniteScrollEnabled) {
            this._environments = RemoteData.loading();
            this.notify();
        }

        const params = {
            'page[offset]': this._pagination.firstItemOffset,
            'page[limit]': this._pagination.itemsPerPage,
        };

        const endpoint = `/api/environments?${new URLSearchParams(params).toString()}`;

        try {
            const { items, totalCount } = await getRemoteDataSlice(endpoint);
            this._environments = RemoteData.success([...concatenateWith, ...items]);
            this._pagination.itemsCount = totalCount;
        } catch (errors) {
            this._environments = RemoteData.failure(errors);
        }

        this.notify();
    }

    /**
     * Reste the model state to its default values
     *
     * @returns {void}
     */
    reset() {
        this._environments = RemoteData.notAsked();
    }

    /**
     * Returns the pagination model
     *
     * @returns {PaginationModel} the pagination model
     */
    get pagination() {
        return this._pagination;
    }

    /**
     * Returns the current environments list as remote data
     *
     * @returns {RemoteData} the environments list
     */
    get environments() {
        return this._environments;
    }

    /**
     * Returns the environments table model
     *
     * @returns {EnvironmentTableModel} the environments table model
     */
    get environmentTableModel() {
        return this._environmentTableModel;
    }
}

/**
 * The Environment Table Model controls how environments data is modified
 * for use in a data table component.
 */
class EnvironmentTableModel {
    /**
     * Constructor which defines models for each column to display
     */
    constructor() {
        this._id = new PassThroughColumnmodel('id');
        this._updatedAt = new PassThroughColumnmodel('updatedAt');
        this._createdAt = new PassThroughColumnmodel('createdAt');
        this._status = new EnvironmentStatusColumnModel('status');
        this._statusMessage = new PassThroughColumnmodel('statusMessage');
        this._runs = new PassThroughColumnmodel('runs');
    }

    /**
     * Returns the column model for the environment id
     * @returns {ColumnModel} the column model for the environment id
     */
    get id() {
        return this._id;
    }

    /**
     * Returns the column model for the environment updatedAt time
     * @returns {ColumnModel} the column model for the environment updatedAt time
     */
    get updatedAt() {
        return this._updatedAt;
    }

    /**
     * Returns the column model for the environment createdAt time
     * @returns {ColumnModel} the column model for the environment createdAt time
     */
    get createdAt() {
        return this._createdAt;
    }

    /**
     * Returns the column model for the environment status
     * @returns {ColumnModel} the column model for the environment status
     */
    get status() {
        return this._status;
    }

    /**
     * Returns the column model for the environment status message
     * @returns {ColumnModel} the column model for the environment status message
     */
    get statusMessage() {
        return this._statusMessage;
    }

    /**
     * Returns the column model for the environment runs
     * @returns {ColumnModel} the column model for the environment runs
     */
    get runs() {
        return this._runs;
    }
}

/**
 * A custom column model for environments which determines the data contained in the env
 * in the environment status column.
 *
 * @class
 * @implements {ColumnModel}
 */
class EnvironmentStatusColumnModel {
    /**
     * Constructor
     */
    constructor() {}

    /**
     * Returns a message to be displayed in a tooltip based on the environment status
     * @param {V} status the status of the environment
     * @returns {string} a tooltip message dependent on the status
     */
    _getTooltipMessage(status) {
        if (status === 'ERROR') {
            return 'Environment has been in ERROR state';
        }
        if (status === 'DANGER') {
            return 'Environment has been in ERROR state';
        }
        return null;
    }

    /**
     * Gets the status and the history items used to display this column
     * @param {T} row the environment being displayed in this row
     * @returns {Object} an object containing the envrionment status and history items.
     */
    getValue(row) {
        const { status, historyItems } = row;
        return { status, historyItems };
    }
}
