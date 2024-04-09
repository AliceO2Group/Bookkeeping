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
import { RunsOverviewModel } from '../Overview/RunsOverviewModel.js';
import { dplDetectorsProvider } from '../../../services/detectors/dplDetectorsProvider.js';

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
        this._detectors$ = dplDetectorsProvider.physical$;
        this._detectors$.bubbleTo(this);
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
        super.load();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        return buildUrl(super.getRootEndpoint(), {
            filter: {
                lhcPeriods: this._lhcPeriodName,
                runQualities: 'good',
                definitions: 'PHYSICS',
            },
        });
    }

    /**
     * Get name of current lhc period which runs are fetched
     */
    get lhcPeriodName() {
        return this._lhcPeriodName;
    }

    /**
     * Get all detectors
     * @return {RemoteData<DplDetector[]>} detectors
     */
    get detectors() {
        return this._detectors$.getCurrent();
    }
}
