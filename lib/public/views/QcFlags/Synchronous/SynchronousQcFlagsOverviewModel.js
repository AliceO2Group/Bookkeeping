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
import { QcFlagsOverviewModel } from '../Overview/QcFlagsOverviewModel.js';

/**
 * Synchronous Quality Control Flags overview model
 *
 * @implements {OverviewModel}
 */
export class SynchronousQcFlagsOverviewModel extends QcFlagsOverviewModel {
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
        return buildUrl('/api/qcFlags/synchronous', { detectorId: this._dplDetectorId, runNumber: this._runNumber });
    }
}