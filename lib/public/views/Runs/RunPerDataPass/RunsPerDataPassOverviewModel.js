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
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';

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
        this._qcSummary$ = new ObservableData(RemoteData.NotAsked());
        this._qcSummary$.bubbleTo(this);
        this._gaqSummary$ = new ObservableData(RemoteData.NotAsked());
        this._gaqSummary$.bubbleTo(this);

        this.patchDisplayOptions({ horizontalScrollEnabled: true });
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

    /**
     * Fetch QC summaries for given data pass
     * @return {Promise<void>} promise
     */
    async _fetchQcSummary() {
        this._qcSummary$.setCurrent(RemoteData.loading());
        try {
            const { data: qcSummary } = await getRemoteData(buildUrl('/api/qcFlags/summary', { dataPassId: this._dataPassId }));
            this._qcSummary$.setCurrent(RemoteData.success(qcSummary));
        } catch (error) {
            this._qcSummary$.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * Fetch GAQ summary for given data pass
     * @return {Promise<void>} resolves once data are fetched
     */
    async _fetchGaqSummary() {
        this._gaqSummary$.setCurrent(RemoteData.loading());
        try {
            const { data: gaqSummary } = await getRemoteData(buildUrl('/api/qcFlags/summary/gaq', { dataPassId: this._dataPassId }));
            this._gaqSummary$.setCurrent(RemoteData.success(gaqSummary));
        } catch (error) {
            this._gaqSummary$.setCurrent(RemoteData.failure(error));
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
        this._fetchQcSummary();
        this._fetchGaqSummary();
        super.load();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        return buildUrl(super.getRootEndpoint(), { filter: { dataPassIds: [this._dataPassId] } });
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

    /**
     * QC summary getter
     * @return {RemoteData<QcSummary>} QC summary
     */
    get qcSummary() {
        return this._qcSummary$.getCurrent();
    }

    /**
     * GAQ summary getter
     * @return {RemoteData<GaqSummary>} GAQ summary
     */
    get gaqSummary() {
        return this._gaqSummary$.getCurrent();
    }

    /**
     * Data pass id getter
     * @return {number} current data pass id
     */
    get dataPassId() {
        return this._dataPassId;
    }
}
