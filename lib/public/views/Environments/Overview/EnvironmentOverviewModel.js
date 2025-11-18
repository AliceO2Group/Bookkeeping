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

import { OverviewPageModel } from '../../../models/OverviewModel.js';

/**
 * Environment overview page model
 */
export class EnvironmentOverviewModel extends OverviewPageModel {
    /**
     * Constructor
     */
    constructor() {
        super();
    }

    /**
     * @inheritDoc
     */
    getRootEndpoint() {
        return '/api/environments';
    }

    /**
     * Returns the current environments list as remote data
     *
     * @return {RemoteData} the environments list
     */
    get environments() {
        return this.items;
    }
}
