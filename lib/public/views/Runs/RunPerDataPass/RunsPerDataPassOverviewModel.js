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
import { RemoteData } from '/js/src/index.js';
import { buildUrl } from '../../../utilities/fetch/buildUrl.js';
import { RunsOverviewModel } from '../Overview/RunsOverviewModel.js';
import { ObservableData } from '../../../utilities/ObservableData.js';
import { getRemoteDataSlice } from '../../../utilities/fetch/getRemoteDataSlice.js';
import { dplDetectorsProvider } from '../../../services/detectors/dplDetectorsProvider.js';

/**
 * Runs Per Data Pass overview model
 */
export class RunsPerDataPassOverviewModel extends RunsOverviewModel {
    /**
     * Constructor
     * @param {Model} model global model
     */
    constructor(model) {
        super(model);
        this._detectors$ = dplDetectorsProvider.physical$;
        this._detectors$.bubbleTo(this);
        this._dataPass = new ObservableData(RemoteData.notAsked());
        this._dataPass.bubbleTo(this);
    }

    /**
     * Fetch data pass data which runs are fetched
     * @return {Promise<void>} promise
     */
    async _fetchDataPass() {
        this._dataPass.setCurrent(RemoteData.loading());
        try {
            const { items: [dataPass] = [] } = await getRemoteDataSlice(`/api/dataPasses?filter[ids][]=${this._dataPassId}`);
            this._dataPass.setCurrent(RemoteData.success(dataPass));
        } catch (error) {
            this._dataPass.setCurrent(RemoteData.failure(error));
        }
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    async load() {
        if (!this._dataPassId) {
            return;
        }
        this._fetchDataPass();
        super.load();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        const endpint = super.getRootEndpoint();
        return buildUrl(endpint, { filter: {
            dataPassIds: [this._dataPassId],
        } });
    }

    /**
     * Set id of data pass which runs are to be fetched
     * @param {number} dataPassId id of Data Pass
     */
    set dataPassId(dataPassId) {
        this._dataPassId = dataPassId;
    }

    /**
     * Get current data pass which runs are fetched
     */
    get dataPass() {
        return this._dataPass.getCurrent();
    }

    /**
     * Get all detectors
     * @return {RemoteData<DplDetector[]>} detectors
     */
    get detectors() {
        return this._detectors$.getCurrent();
    }
}
