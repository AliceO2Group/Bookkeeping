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
import { getFlagReasonColor } from '../common/flagReasonsColors.js';

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
                this._timeStartModel = new DateTimeInputModel({
                    required: true,
                    inputTimeStep: 1,
                    min: timeTrgStart,
                    max: timeTrgEnd,
                    defaults: {
                        date: dateTrgStart,
                    },
                });

                // this._timeStartModel.observe(() => {
                //     if (this._timeEndModel && this._timeStartModel.value) {
                //         this._timeEndModel.min = this._timeStartModel.value + 1;
                //     }
                // });

                this._timeStartModel.update(this._timeStartModel._defaults);
                this._timeStartModel.bubbleTo(this);
                this._timeStartModel.visualChange$.bubbleTo(this);

                this._timeEndModel = new DateTimeInputModel({
                    required: true,
                    inputTimeStep: 1,
                    min: timeTrgStart,
                    max: timeTrgEnd,
                    defaults: {
                        date: dateTrgEnd,
                    },
                });

                // this._timeEndModel.observe(() => {
                //     if (this._timeStartModel && this._timeEndModel.value) {
                //         this._timeStartModel.max = this._timeEndModel.value - 1;
                //     }
                // });

                this._timeEndModel.update(this._timeEndModel._defaults);
                this._timeEndModel.bubbleTo(this);
                this._timeEndModel.visualChange$.bubbleTo(this);
            },
        });
    }

    get fill() {
        const selectedFlagReason = this._flagReasonsSelectionModel.selectedOptions[0]?.original;
        return selectedFlagReason ? getFlagReasonColor(selectedFlagReason) : null;
    }

    get x() {
        return [this._timeStartModel?.value, this._timeEndModel?.value];
    }

    get y() {
        return 'NEW*'
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

    set comment(comment) {
        this._comment = comment;
    }

    get timeStartModel() {
        return this._timeStartModel;
    }

    get timeEndModel() {
        return this._timeEndModel;
    }

    get comment() {
        return this._comment;
    }
}
