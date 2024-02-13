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

import { ObservableData } from '../../../utilities/ObservableData';
import { jsonFetch } from '../../../utilities/fetch/jsonFetch';
import { RemoteData, Observable } from '/js/src/index.js';

/**
 * Quality Control Flag Creation model
 */
export class QualityControlFlagCreationModel extends Observable {
    /**
     * Constructor
     */
    constructor({
        flagReasonId,
        runNumber,
        dataPassId,
        detectorId,
        externalUserId,
    }) {
        super();

        this._timeStart = null;
        this._timeEnd = null;
        this._provenance = 'HUMAN';
        this._comment = null;
        this._flagReasonId = flagReasonId;
        this._runNumber = runNumber;
        this._dataPassId = dataPassId;
        this._detectorId = detectorId;
        this._externalUserId = externalUserId;

        this._observableCreationResult = ObservableData(RemoteData.notAsked());
    }

    /**
     * 
     */
    async submit() {
        const {
            timeStart,
            timeEnd,
            provenance,
            comment,
            flagReasonId,
            runNumber,
            dataPassId,
            detectorId,
            externalUserId,
        } = this;

        const options = {
            method: 'POST',
            headers: { Accept: 'application/json' },
            body: JSON.stringify({
                timeStart,
                timeEnd,
                provenance,
                comment,
                flagReasonId,
                runNumber,
                dataPassId,
                detectorId,
                externalUserId,
            }),
        };
        try {
            this._observableCreationResult.setCurrent(RemoteData.loading());
            const result = await jsonFetch('/api/qualityControlFlags', options);
            this._observableCreationResult.setCurrent(RemoteData.failure(result));
        } catch (error) {
            this._observableCreationResult.setCurrent(RemoteData.failure(error));
        }
    }

    set timeStart(timeStart) {
        this._timeStart = timeStart;
    }

    set timeEnd(timeEnd) {
        this._timeEnd = timeEnd;
    }

    set provenance(provenance) {
        this._provenance = provenance;
    }

    set comment(comment) {
        this._comment = comment;
    }

    set flagReasonId(flagReasonId) {
        this._flagReasonId = flagReasonId;
    }


    get timeStart() {
        return this._timeStart;
    }

    get timeEnd() {
        return this._timeEnd;
    }

    get provenance() {
        return this._provenance;
    }

    get comment() {
        return this._comment;
    }

    get flagReasonId() {
        return this._flagReasonId;
    }

}
