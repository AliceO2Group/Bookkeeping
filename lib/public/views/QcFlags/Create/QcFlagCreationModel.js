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
import { RemoteData } from '/js/src/index.js';
import { QcFlagTypesSelectionDropdownModel }
    from '../../../components/qualityControlFlags/QualityControlFlagReasonSelectionDropdownModel.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';
import { TimeRangeFilterModel } from '../../../components/Filters/common/filters/TimeRangeFilterModel.js';
import { CreationModel } from '../../../models/CreationModel.js';

/**
 * Quality Control Flag Creation model
 */
export class QualityControlFlagCreationModel extends CreationModel {
    /**
     * Constructor
     */
    constructor({
        runNumber,
        dataPassId,
        dplDetectorId,
    }, onCreationSuccess) {
        super('/api/qcflagTypes', ({ id }) => onCreationSuccess(id));

        this._runNumber = runNumber;
        this._observableRun = new ObservableData(RemoteData.notAsked());
        this._observableRun.bubbleTo(this);

        this._dataPassId = dataPassId;
        this._dplDetectorId = dplDetectorId;

        this._qcFlagTypeSelectionModel = new QcFlagTypesSelectionDropdownModel({
            multiple: false,
        });
        this._qcFlagTypeSelectionModel.visualChange$.bubbleTo(this);

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
    get qcFlagTypeSelectionModel() {
        return this._qcFlagTypeSelectionModel;
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
}
