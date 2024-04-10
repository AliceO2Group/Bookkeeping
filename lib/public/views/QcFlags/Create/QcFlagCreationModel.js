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

import { ObservableData } from '../../../utilities/ObservableData.js';
import { jsonFetch } from '../../../utilities/fetch/jsonFetch.js';
import { RemoteData, Observable } from '/js/src/index.js';
import { QualityControlFlagReasonSelectionDropdownModel }
    from '../../../components/qualityControlFlags/QualityControlFlagReasonSelectionDropdownModel.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';
import { getFlagReasonColor } from '../common/flagReasonsColors.js';
import { TimeRangeFilterModel } from '../../../components/Filters/common/filters/TimeRangeFilterModel.js';

/**
 * Quality Control Flag Creation model
 */
export class QualityControlFlagCreationModel extends Observable {
    /**
     * Constructor
     */
    constructor({
        runNumber,
        dataPassId,
        detectorId,
        externalUserId,
    }, onSuccess) {
        super();
        this._onSucess = onSuccess;

        this._runNumber = runNumber;
        this._observableRun = new ObservableData(RemoteData.notAsked());
        this._observableRun.bubbleTo(this);

        this._dataPassId = dataPassId;
        this._detectorId = detectorId;
        this._externalUserId = externalUserId;
        this._provenance = 'HUMAN';

        this._comment = null;

        this._observableCreationResult = new ObservableData(RemoteData.notAsked());
        this._observableCreationResult.bubbleTo(this);

        this._flagReasonsSelectionModel = new QualityControlFlagReasonSelectionDropdownModel({
            multiple: false,
        });
        this._flagReasonsSelectionModel.bubbleTo(this);
        this._flagReasonsSelectionModel.visualChange$.bubbleTo(this);

        this._initilize();
    }

    /**
     * 
     */
    get timeStartModel() {
        return this._timeRangeModel?.fromTimeInputModel;
    }

    /**
     * 
     */
    get timeEndModel() {
        return this._timeRangeModel?.toTimeInputModel;
    }

    /**
     * 
     */
    async _initilize() {
        await this._fetchRun();
        this._observableRun.getCurrent().match({
            Other: () => null,
            Success: (run) => {
                const { timeTrgStart, timeTrgEnd } = run;

                this._timeRangeModel = new TimeRangeFilterModel(null, null, {
                    required: true,
                    min: timeTrgStart,
                    max: timeTrgEnd,
                    timeStep: 1000,
                });

                const m = this._timeRangeModel.fromTimeInputModel.formatDateForHTMLInput(this._timeRangeModel.fromTimeInputModel.min);
                this._timeRangeModel.fromTimeInputModel.update(m);

                const M = this._timeRangeModel.toTimeInputModel.formatDateForHTMLInput(this._timeRangeModel.toTimeInputModel.max);
                this._timeRangeModel.toTimeInputModel.update(M);

                this._timeRangeModel.bubbleTo(this);
            },
        });
    }

    /**
     * 
     */
    get fill() {
        const selectedFlagReason = this._flagReasonsSelectionModel.selectedOptions[0]?.original;
        return selectedFlagReason ? getFlagReasonColor(selectedFlagReason) : null;
    }

    /**
     * 
     */
    get x() {
        return [
            this.timeStartModel?.value ?? this._observableRun.getCurrent()?.timeTrgStart,
            this.timeEndModel?.value ?? this._observableRun.getCurrent()?.timeTrgEnd,
        ];
    }

    /**
     * 
     */
    get y() {
        return 'NEW*';
    }

    /**
     * Fetch run data
     * @return {Promise<void>} promise
     */
    async _fetchRun() {
        this._observableRun.setCurrent(RemoteData.loading());
        try {
            const { data: run } = await getRemoteData(`/api/runs/${this._runNumber}`);
            this._observableRun.setCurrent(RemoteData.success(run));
        } catch (error) {
            this._observableRun.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * 
     */
    get flagReasonsSelectionModel() {
        return this._flagReasonsSelectionModel;
    }

    get flagReason() {
        return this._flagReasonsSelectionModel.selectedOptions[0]?.original
    }

    /**
     *
     */
    async submit() {
        const body = {
            timeStart: this.timeStartModel.value,
            timeEnd: this.timeEndModel.value,
            provenance: this._provenance,
            comment: this._comment,
            flagReasonId: this._flagReasonsSelectionModel.selectedOptions[0]?.value,
            runNumber: this._runNumber,
            dataPassId: this._dataPassId,
            detectorId: this._detectorId,
            externalUserId: this._externalUserId,
        };

        const options = {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(body),
        };

        try {
            this._observableCreationResult.setCurrent(RemoteData.loading());
            const result = await jsonFetch('/api/qualityControlFlags', options);
            this._observableCreationResult.setCurrent(RemoteData.success(result));
            if (this._onSucess) {
                this._onSucess();
            }
        } catch (error) {
            this._observableCreationResult.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * 
     */
    get subbmitResult() {
        return this._observableCreationResult.getCurrent();
    }

    /**
     * 
     */
    set comment(comment) {
        this._comment = comment;
    }

    /**
     * 
     */
    get comment() {
        return this._comment;
    }
}
