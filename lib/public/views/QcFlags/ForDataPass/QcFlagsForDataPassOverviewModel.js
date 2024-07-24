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

import { buildUrl } from '../../../utilities/fetch/buildUrl.js';
import { RemoteData } from '/js/src/index.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';
import { QcFlagsOverviewModel } from '../Overview/QcFlagsOverviewModel.js';
import { ObservableData } from '../../../utilities/ObservableData.js';

/**
 * Quality Control Flags for data pass overview model
 *
 * @implements {OverviewModel}
 */
export class QcFlagsForDataPassOverviewModel extends QcFlagsOverviewModel {
    /**
     * The constructor of the Overview model object
     */
    constructor() {
        super();
        this._dataPass$ = new ObservableData(RemoteData.notAsked());
        this._dataPass$.bubbleTo(this);
    }

    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        return buildUrl('/api/qcFlags/perDataPass', {
            dataPassId: this._dataPassId,
            runNumber: this._runNumber,
            dplDetectorId: this._dplDetectorId,
        });
    }

    /**
     * @inheritdoc
     */
    async load() {
        await super.load();
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
     * Set id of data pass which for QC flags should be fetched
     * @param {number} dataPassId data pass id
     */
    set dataPassId(dataPassId) {
        this._dataPassId = dataPassId;
    }

    /**
     * Get current data pass which QC flags are fetched
     * @return {RemoteData<DataPass>} data pass remote data
     */
    get dataPass() {
        return this._dataPass$.getCurrent();
    }

    /**
     * Data pass id getter
     * @return {number} current data pass id
     */
    get dataPassId() {
        return this._dataPassId;
    }
}
