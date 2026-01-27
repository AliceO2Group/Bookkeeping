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

import { RunsWithQcModel } from './RunsWithQcModel.js';

/**
 * FixedPdpBeamTypeRunsOverviewModel
 *
 * Runs overview model which stores information about pdp_beam_type,
 * which is supposed to be the same for all runs stored in this model
 */
export class FixedPdpBeamTypeRunsOverviewModel extends RunsWithQcModel {
    /**
     * Constructor
     * @param {Model} model global model
     */
    constructor(model) {
        super(model);
        this._pdpBeamTypes = [];
    }

    /**
     * Get pdp_beam_type of fetched runs
     *
     * @return {string[]} beam type
     */
    get pdpBeamTypes() {
        return this._pdpBeamTypes;
    }

    /**
     * Set pdp_beam_type of fetched runs
     *
     * @param {string|string[]|null} pdpBeamTypes beam type, nullish values are ignored
     */
    setPdpBeamTypes(pdpBeamTypes) {
        if (pdpBeamTypes) {
            this._pdpBeamTypes = typeof pdpBeamTypes === 'string' ? pdpBeamTypes.split(',') : pdpBeamTypes;
        }
    }
}
