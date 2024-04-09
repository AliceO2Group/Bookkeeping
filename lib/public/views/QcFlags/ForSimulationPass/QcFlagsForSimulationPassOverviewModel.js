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

/**
 * Quality Control Flags For Simulation Pass overview model
 *
 * @implements {OverviewModel}
 */
export class QcFlagsForSimulationPassOverviewModel extends QcFlagsOverviewModel {
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
                simulationPassIds: [this._dataProductionId],
            },
        };

        return buildUrl(super.getRootEndpoint(), params);
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    async _fetchDataProduction() {
        this._dataProduction$.setCurrent(RemoteData.loading());
        try {
            const { data: simulationPass } = await getRemoteData(`/api/simulationPasses/${this._dataProductionId}`);
            this._dataProduction$.setCurrent(RemoteData.success(simulationPass));
        } catch (error) {
            this._dataProduction$.setCurrent(RemoteData.failure(error));
        }
    }
}
