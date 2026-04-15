/**
 * @license
 * Copyright CERN and copyright holders of ALICE Trg. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-Trg.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { FilterModel } from '../common/FilterModel.js';

/**
 * Time-range filter model
 */
export class MultiCompositionFilterModel extends FilterModel {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._detectors = {};
    }

    putFilter(id, filterModel) {
        this._detectors[id] = filterModel;
        this._addSubmodel(filterModel);
    }

    reset() {
        Object.values(this._detectors).forEach((detector) => detector.reset());
    }

    get isEmpty() {
        Object.values(this._detectors).every((detector) => detector.isEmpty());
    }

    /**
     * @inheritDoc
     */
    get normalized() {
        const normalized = {};

        for (const [id, detector] of Object.entries(this._detectors)) {
            if (!detector.isEmpty) {
                normalized[id] = detector.normalized;
            }
        }

        return normalized;
    }
}
