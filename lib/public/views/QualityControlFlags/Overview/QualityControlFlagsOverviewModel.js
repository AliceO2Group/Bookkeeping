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
import { OverviewPageModel } from '../../../models/OverviewModel.js';
import { RemoteData } from '/js/src/index.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';

/**
 * Quality Control Flags overview model
 *
 * @implements {OverviewModel}
 */
export class QualityControlFlagsOverviewModel extends OverviewPageModel {
    /**
     * The constructor of the Overview model object
     */
    constructor() {
        super();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        const params = {
            filter: {
                runNumbers: [this._runNumber],
                dataPassIds: [this._dataPassId],
                detectorIds: [this._detectorId],
            },
        };

        return buildUrl('/api/qualityControlFlags', params);
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    async load({ dataPassId, runNumber, detectorId } = {}) {
        this._dataPassId = dataPassId || this._dataPassId;
        this._runNumber = runNumber || this._runNumber;
        this._detectorId = detectorId || this._detectorId;
        if (!this._dataPassId || !runNumber || !detectorId) {
            return;
        }
        this._fetchRun();
        super.load();
    }

    /**
     * Fetch run data
     * @return {Promise<void>} promise
     */
    async _fetchRun() {
        this._run = RemoteData.loading();
        try {
            const { data: run } = await getRemoteData(`/api/runs/${this._runNumber}`);
            this._run = RemoteData.success(run);
        } catch (error) {
            this._run = RemoteData.filure(error);
        }
    }

    /**
     * Run getter
     * @return {Run} current run
     */
    get run() {
        return this._run;
    }
}
