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

import { Observable, RemoteData } from '/js/src/index.js';
import { getRemoteData } from '../../utilities/fetch/getRemoteData.js';
import { ObservableData } from '../../utilities/ObservableData.js';

/**
 * Service class to fetch QC flag types from the backend
 */
export class QcFlagTypesProvider extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._notArchived$ = new ObservableData(RemoteData.notAsked());
    }

    /**
     * Return not archived QC flag types observable data
     *
     * @return {ObservableData<RemoteData<QcFlagType[], ApiError>>} the observable QC flag types
     */
    get notArchived$() {
        if (this._isStale()) {
            this._load();
        }
        return this._notArchived$;
    }

    /**
     * States if the cached QC flag types list need to be created or updated
     *
     * @return {boolean} true if the QC flag types list must be refreshed
     * @private
     */
    _isStale() {
        return this._notArchived$.getCurrent().match({
            NotAsked: () => true,
            Other: () => false,
        });
    }

    /**
     * Load all the QC flag types and feed the observable data
     *
     * @return {void}
     * @private
     */
    _load() {
        this._notArchived$.setCurrent(RemoteData.loading());
        getRemoteData('/api/qcFlagTypes?filter[archived]=false').then(
            ({ data: qcFlagTypes }) => this._notArchived$.setCurrent(RemoteData.success(qcFlagTypes)),
            (error) => this._notArchived$.setCurrent(RemoteData.failure(error)),
        );
    }
}

export const qcFlagTypesProvider = new QcFlagTypesProvider();
