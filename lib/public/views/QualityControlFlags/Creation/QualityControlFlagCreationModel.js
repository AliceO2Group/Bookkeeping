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
import { DateTimeInputModel } from '../../../components/common/form/inputs/DateTimeInputModel.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';
import { formatUTCDateForHTMLInput } from '../../../utilities/formatting/HTMLInputDateFormat.js';

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
    }) {
        super();

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
    async _initilize() {
        await this._fetchRun();
        this._observableRun.getCurrent().match({
            Other: () => null,
            Success: (run) => {
                const { timeTrgStart, timeTrgEnd } = run;

                const formatTimestamp = (timestamp) =>
                    formatUTCDateForHTMLInput(timestamp - new Date(timestamp).getTimezoneOffset() * 60 * 1000);

                const dateTrgStart = formatTimestamp(timeTrgStart).date;
                const dateTrgEnd = formatTimestamp(timeTrgEnd).date;
                this._timeStart = new DateTimeInputModel({
                    required: true,
                    inputTimeStep: 1,
                    min: timeTrgStart,
                    max: timeTrgEnd,
                    defaults: {
                        date: dateTrgStart,
                    },
                });

                this._timeStart.observe(() => {
                    if (this._timeEnd && this._timeStart.value) {
                        this._timeEnd.min = this._timeStart.value + 1;
                    }
                });

                this._timeStart.update(this._timeStart._defaults);
                this._timeStart.bubbleTo(this);
                this._timeStart.visualChange$.bubbleTo(this);

                this._timeEnd = new DateTimeInputModel({
                    required: true,
                    inputTimeStep: 1,
                    min: timeTrgStart,
                    max: timeTrgEnd,
                    defaults: {
                        date: dateTrgEnd,
                    },
                });

                this._timeEnd.observe(() => {
                    if (this._timeStart && this._timeEnd.value) {
                        this._timeStart.max = this._timeEnd.value - 1;
                    }
                });

                this._timeEnd.update(this._timeEnd._defaults);
                this._timeEnd.bubbleTo(this);
                this._timeEnd.visualChange$.bubbleTo(this);
            },
        });
    }

    /**
     * 
     * @returns 
     */
    getFlagToDisply() {
        const p = {
            y: 'NEW*',
            flagReason: this._flagReasonsSelectionModel.selectedOptions[0]?.original ?? { name: 'NEW*' },
            timeStart: this._timeStart?.value,
            timeEnd: this._timeEnd?.value,
        };
        if (!this._beingCreated) {
            this._beingCreated = p;
        } else {
            this._beingCreated.flagReason = p.flagReason;
            this._beingCreated.timeEnd = p.timeEnd;
            this._beingCreated.timeStart = p.timeStart;
        }
        return this._beingCreated;
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

    set comment(comment) {
        this._comment = comment;
    }


    get timeStart() {
        return this._timeStart;
    }

    get timeEnd() {
        return this._timeEnd;
    }

    get comment() {
        return this._comment;
    }
}
