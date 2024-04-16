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

import { ObservableData } from '../../../../utilities/ObservableData.js';
import { getRemoteData } from '../../../../utilities/fetch/getRemoteData.js';
import { RemoteData, Observable } from '/js/src/index.js';

/**
 * QC Flag details for data pass model
 */
export class QcFlagDetailsForDataPassModel extends Observable {
    /**
     * Constructor
     *
     * @param {number} [parameteres.id] QC flag id
     * @param {function} onDeleteSuccess callback in case the flag is successfuly deleted
     */
    constructor(
        { id, dataPassId },
        onDeleteSuccess,
    ) {
        super({ id }, onDeleteSuccess);
        this._dataPassId = dataPassId;
        this._dataPass$ = new ObservableData(RemoteData.notAsked());
        this._fetchDataPass();
    }

    /**
     * Fetch data pass data which QC flags are fetched
     * @return {Promise<void>} promise
     */
    async _fetchDataPass() {
        this._dataPass$.setCurrent(RemoteData.loading());
        try {
            const { data: [dataPass] } = await getRemoteData(`/api/dataPasses/?filter[ids][]=${this._dataPassId}`);
            this._dataPass$.setCurrent(RemoteData.success(dataPass));
        } catch (error) {
            this._dataPass$.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * Get current data pass which QC flags are fetched
     * @return {RemoteData<DataPass>} data pass remote data
     */
    get dataPass() {
        return this._dataPass$.getCurrent();
    }
}
