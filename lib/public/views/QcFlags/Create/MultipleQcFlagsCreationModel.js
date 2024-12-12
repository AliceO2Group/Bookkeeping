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

import { QcFlagTypesSelectionDropdownModel } from '../../../components/qcFlags/qcFlagTypesSelectionDropdownModel.js';
import { TimeRangeInputModel } from '../../../components/Filters/common/filters/TimeRangeInputModel.js';

/**
 * Multiple QC Flags Creation model
 */
export class MultipleQcFlagsCreationModel {
    constructor(selectedDetectors, qcFlagModels) {        
        this._selectedDetectors = selectedDetectors;
        this._qcFlagModels = qcFlagModels;
        this._isTimeBased = false;
        this._startTime = null;
        this._endTime = null;
        this._comment = '';
        this._formData = {
            comment: ''
        };

        this._flagTypeSelectionModel = new QcFlagTypesSelectionDropdownModel({
            multiple: false,
        });
        this._flagTypeSelectionModel.bubbleTo(this);
        this._flagTypeSelectionModel.visualChange$.bubbleTo(this);
        
        this._setTimings();

        this.timeRangeModel = new TimeRangeInputModel({
            from: this._startTime,
            to: this._endTime,
            inline: true,
            disabled: !this._isTimeBased,
            onInput: this._setIsTimeBased.bind(this),
        });
    }

    _setTimings() {
        this._isTimeBased = this._qcFlagModels.every((model) => model.isTimeBasedQcFlag);

        if (this._isTimeBased) {
            this._startTime = Math.min(
                ...this._qcFlagModels.map((model) => model.timeRangeModel.fromTimeInputModel.value)
            );
            this._endTime = Math.max(
                ...this._qcFlagModels.map((model) => model.timeRangeModel.toTimeInputModel.value)
            );
        }
    }

    _getSerializableData(model) {
        return {
            runNumber: model.runNumber,
            dplDetectorId: model.dplDetectorId,
            flagTypeId: this._flagTypeSelectionModel.selected[0],
            from: this._startTime,
            to: this._endTime,
            comment: this._comment
        };
    }

    patchFlagModels() {
        this._qcFlagModels.forEach((model) => {
            model.initOrResetData();
            model.patchFormData(this._getSerializableData(model));
        });
    }

    formatRunStart = () => {
        if (this._startTime) {
            return formatTimestamp(this._startTime, false);
        } 

        return '-';
    }

    formatRunEnd = () => {
        if (this._endTime) {
            return formatTimestamp(this._endTime, false);
        }

        return '-';
    }

    get startTime() {
        return this._startTime;
    }

    get endTime() {
        return this._endTime;
    }

    get isTimeBased() {
        return this._isTimeBased;
    }

    get flagTypeSelectionModel() {
        return this._flagTypeSelectionModel;
    }

    get comment() {
        return this._comment;
    }

    get formData() {
        return this._formData;
    }

    _setIsTimeBased() {
        this._isTimeBased = !this._isTimeBased;
    }
}
