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
import { DataPassesOverviewModel } from '../DataPassesOverviewModel.js';
import { buildUrl } from '/js/src/index.js';

/**
 * Data Passes Per LHC Period overview model
 */
export class DataPassesPerLhcPeriodOverviewModel extends DataPassesOverviewModel {
    /**
     * Constructor
     */
    constructor() {
        super();
    }

    /**
     * @inheritdoc
     */
    async load({ lhcPeriodId } = {}) {
        this._lhcPeriodId = lhcPeriodId ?? this._lhcPeriodId;
        super.load();
    }

    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        const { filter, sort } = this.getBaseParams();
        console.log(sort)
        const params = {
            filter: {
                lhcPeriodIds: [this._lhcPeriodId],
                ...filter,
            },
            ...sort,
        };

        return buildUrl('/api/dataPasses', params);
    }

    /**
     * Get id of current lhc period which data passes are fetched
     */
    get lhcPeriodId() {
        return this._lhcPeriodId;
    }
}
