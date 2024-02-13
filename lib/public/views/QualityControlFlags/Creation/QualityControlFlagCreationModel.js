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

import { Observable } from '/js/src/index.js';

/**
 * Quality Control Flag Creation model
 */
class QualityControlFlagCreationModel extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._timeStart = null;
        this._timeEnd = null;
        this._provenance = 'HUMAN';
        this._comment = null;

        this._qualityControlFlagId = null;
        this._flagReasonId = null;
        this._runNumber = null;
        this._dataPassId = null;
        this._detectorId = null;
        this._externalUserId = null;
    }
}