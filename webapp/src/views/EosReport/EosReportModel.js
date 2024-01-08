/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

import { Observable } from '/js/src/index.js';
import { EosReportCreationModel } from './create/EosReportCreationModel.js';

/**
 * Model to store the state of the EOS report related pages
 */
export class EosReportModel extends Observable {
    /**
     * Constructor
     * @param {Model} model the global model
     */
    constructor(model) {
        super();

        this._creationModel = null;
        this._model = model;
    }

    /**
     * Load the creation page
     *
     * @param {string} shiftType the type of the shift for which report will be created
     * @return {void}
     */
    loadCreation(shiftType) {
        if (shiftType) {
            this._creationModel = new EosReportCreationModel(shiftType, (logId) => this._model.router.go(`/?page=log-detail&id=${logId}`, true));
            this._creationModel.bubbleTo(this);
        } else {
            this._creationModel = null;
        }
    }

    /**
     * Returns the creation model
     *
     * @return {EosReportCreationModel|null} the creation model
     */
    get creationModel() {
        return this._creationModel;
    }
}
