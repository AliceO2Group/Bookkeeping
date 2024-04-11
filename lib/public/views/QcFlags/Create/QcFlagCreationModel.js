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
import { dplDetectorsProvider } from '../../../services/detectors/dplDetectorsProvider.js';

/**
 * Quality Control Flag Creation model
 */
export class QcFlagCreationModel extends CreationModel {
    /**
     * Constructor
     */
    constructor({
        runNumber,
        dplDetectorId,
    }, onCreationSuccess) {
        super('/api/qcFlagTypes', ({ id }) => onCreationSuccess(id));

        this._runNumber = runNumber;
        this._run$ = new ObservableData(RemoteData.notAsked());
        this._run$.bubbleTo(this);

        this._dplDetectorId = dplDetectorId;
        dplDetectorsProvider.physical$.observe(() => this._getDetector());
        this._dplDetector$ = new ObservableData(RemoteData.notAsked());
        this._dplDetector$.bubbleTo(this);

        this._flagTypeSelectionModel = new QcFlagTypesSelectionDropdownModel({
            multiple: false,
        });
        this._flagTypeSelectionModel.visualChange$.bubbleTo(this);

        this._initilize();
    }

    /**
     * Apply a patch on current form data
     *
     * @param {Partial<QcFlagTypeCreationFormData>} patch the patch to apply
     * @return {void}
     */
    patchFormData(patch) {
        this.formData = { ...this.formData, ...patch };
        this.notify();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _initOrResetData() {
        this.formData = {
            comment: null,
        };
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _getSerializableData() {
        return {
            runNumber: this._runNumber,
            dplDetectorId: this._dplDetectorId,
            flagTypeId: this._flagTypeSelectionModel.selected[0].id,
            from: this.fromTimeModel.raw,
            to: this.toTimeModel.raw,
        };
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    isValid() {
        return true;
    }

    /**
     * 
     */
    async _initilize() {
        await this._fetchRun();
        this._run$.getCurrent().match({
            Other: () => null,
            Success: (run) => {
                const { startTime, endTime } = run;

                this._timeRangeModel = new TimeRangeFilterModel(null, null, {
                    required: true,
                    // min: timeTrgStart,
                    // max: timeTrgEnd,
                    // timeStep: 1000,
                    seconds: true,
                });

                this._timeRangeModel.fromTimeInputModel.setValue(startTime);
                this._timeRangeModel.toTimeInputModel.setValue(endTime);

                // const m = this._timeRangeModel.fromTimeInputModel.formatDateForHTMLInput(this._timeRangeModel.fromTimeInputModel.min);
                // this._timeRangeModel.fromTimeInputModel.update(m);

                // const M = this._timeRangeModel.toTimeInputModel.formatDateForHTMLInput(this._timeRangeModel.toTimeInputModel.max);
                // this._timeRangeModel.toTimeInputModel.update(M);

                this._timeRangeModel.bubbleTo(this);
            },
        });
    }

    /**
     * Fetch run data
     * @return {Promise<void>} promise
     */
    async _fetchRun() {
        this._run$.setCurrent(RemoteData.loading());
        try {
            const { data: run } = await getRemoteData(`/api/runs/${this._runNumber}`);
            this._run$.setCurrent(RemoteData.success(run));
        } catch (error) {
            this._run$.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * Fetch DPL detector which QC flags should be fetched
     * @return {void}
     */
    _getDetector() {
        this._dplDetector$.setCurrent(dplDetectorsProvider.physical$.getCurrent().match({
            Success: (dplDetectors) => {
                const dplDetector = dplDetectors.find(({ id }) => id === this._dplDetectorId);
                return dplDetector
                    ? RemoteData.success(dplDetector)
                    : RemoteData.failure({ errors: [{ detail: `There is no dplDetector with given id (${this._dplDetectorId})` }] });
            },
            Failure: (payload) => RemoteData.failure(payload),
            Loading: () => RemoteData.loading(),
            NotAsked: () => RemoteData.notAsked(),
        }));
    }

    /**
     * 
     */
    get flagTypeSelectionModel() {
        return this._flagTypeSelectionModel;
    }

    /**
     * 
     */
    get fromTimeModel() {
        return this._timeRangeModel?.fromTimeInputModel;
    }

    /**
     * 
     */
    get toTimeModel() {
        return this._timeRangeModel?.toTimeInputModel;
    }
}
