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

import { RemoteData, sessionService } from '/js/src/index.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';
import { CreationModel } from '../../../models/CreationModel.js';
import { ShiftTypes } from '../../../domain/enums/ShiftTypes.js';

/**
 * Model to store the EOS report creation page's state
 */
export class EosReportCreationModel extends CreationModel {
    /**
     * Constructor
     *
     * @param {'ECS'|'QC/PDP'} reportType type of the EOS report
     * @param {function} onCreationSuccess function called when the EOS report creation is successful, passing the created log ID as parameter
     */
    constructor(reportType, onCreationSuccess) {
        super(`/api/eos-report?reportType=${reportType}`, ({ id }) => onCreationSuccess(id));

        this._currentShiftData = RemoteData.notAsked();
        this._reportType = reportType;
        this._initOrResetData();
        this.fetchShiftData();
    }

    /**
     * Fetch the current shift data
     * @return {void}
     */
    fetchShiftData() {
        this._currentShiftData = RemoteData.loading();
        this.notify();

        getRemoteData(`/api/shift-data?shiftType=${this._reportType}`).then(
            ({ data }) => {
                this._currentShiftData = RemoteData.success(data);
                this.notify();
            },
            (errors) => {
                this._currentShiftData = RemoteData.failure(errors);
                this.notify();
            },
        );
    }

    /**
     * Returns the type of the report
     *
     * @return {"ECS"|"QC/PDP"} the report type
     */
    get reportType() {
        return this._reportType;
    }

    /**
     * Returns the data corresponding to the current shift
     * @return {RemoteData} the current shift data
     */
    get currentShiftData() {
        return this._currentShiftData;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _initOrResetData() {
        /**
         * No need for a class for now
         * If fields need complex verification/formatting or anything else use a class
         *
         * @type {Partial<EosReportCreationRequest>}
         */
        this.data = {
            shifterName: sessionService.get().name,
        };
        switch (this._reportType) {
            case ShiftTypes.ECS:
                this.data.typeSpecific = { environmentComments: {}, runComments: {} };
                break;
            case ShiftTypes.QC_PDP:
                this.data.typeSpecific = { runComments: {} };
                break;
        }
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _getSerializableData() {
        return this.data;
    }
}
