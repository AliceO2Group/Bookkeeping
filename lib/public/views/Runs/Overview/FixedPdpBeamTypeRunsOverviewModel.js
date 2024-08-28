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

const { RunsOverviewModel } = require('./RunsOverviewModel.js');

/**
 * FixedPdpBeamTypeRunsOverviewModel
 */
export class FixedPdpBeamTypeRunsOverviewModel extends RunsOverviewModel {
    /**
     * Constructor
     * @param {Model} model global model
     */
    constructor(model) {
        super(model);
        this._pdpBeamType = null;
    }

    /**
     * Get pdp_beam_type of fetched runs
     *
     * @return {string} beam type
     */
    get pdpBeamTypes() {
        return this._pdpBeamType;
    }

    /**
     * Set pdp_beam_type of fetched runs
     *
     * @param {string} pdpBeamType beam type
     */
    set pdpBeamTypes(pdpBeamType) {
        this._pdpBeamType = pdpBeamType;
    }
}
