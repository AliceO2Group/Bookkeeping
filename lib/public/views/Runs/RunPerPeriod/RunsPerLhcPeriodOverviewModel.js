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
import { detectorsProvider } from '../../../services/detectors/detectorsProvider.js';
import { RunsOverviewModel } from '../Overview/RunsOverviewModel.js';
import { ObservableData } from '../../../utilities/ObservableData.js';

/**
 * Runs Per LHC Period overview model
 */
export class RunsPerLhcPeriodOverviewModel extends RunsOverviewModel {
    /**
     * Constructor
     * @param {Model} model global model
     */
    constructor(model) {
        super(model);
        this._detectors = new ObservableData(RemoteData.notAsked());
        this._detectors.bubbleTo(this);
    }

    /**
     * Retrieve a list of detector types from detectorsProvider
     *
     * @return {Promise<void>} resolves once the data has been fetched
     * @private
     */
    async _fetchDetectors() {
        this._detectors.setCurrent(RemoteData.loading());
        try {
            this._detectors.setCurrent(RemoteData.success(await detectorsProvider.getAll()));
        } catch (error) {
            this._detectors.setCurrent(RemoteData.failure(error));
        }
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    async load({ lhcPeriodName } = {}) {
        this._lhcPeriodName = lhcPeriodName || this._lhcPeriodName;
        if (!this._lhcPeriodName) {
            return;
        }
        this._fetchDetectors();
        super.load();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        const endpint = super.getRootEndpoint();
        return buildUrl(endpint, { filter: {
            lhcPeriods: this._lhcPeriodName,
            runQualities: 'good',
            definitions: 'PHYSICS',
        } });
    }

    /**
     * Get current name of lhc period which runs are fetched
     */
    get lhcPeriodName() {
        return this._lhcPeriodName;
    }

    /**
     * Get all detectors
     * @return {RemoteData<Detector[]>} detectors
     */
    get detectors() {
        return this._detectors.getCurrent();
    }
}
