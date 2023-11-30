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

import { RemoteData, sessionService, Observable } from '/js/src/index.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';
import { CreationModel } from '../../../models/CreationModel.js';
import { ShiftTypes } from '../../../domain/enums/ShiftTypes.js';

/**
 * @typedef MagnetConfiguration the configuration of the magnet
 * @property {string} solenoid the configuration of the solenoid
 * @property {string} dipole the configuration of the dipole
 */

/**
 * @typedef MagnetConfigurationSnapshot
 * @property {number} timestamp the timestamp where the configuration were active
 * @property {MagnetConfiguration} magnetConfiguration the actual configuration of the magnet
 */

/**
 * Model to store the EOS report creation page's state
 */
export class EosReportCreationModel extends CreationModel {
    /**
     * Constructor
     *
     * @param {'ECS'|'QC/PDP'|'SLIMOS'|'SL'|'DCS'} reportType type of the EOS report
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
                this.data.infoFromPreviousShifter = this.data.infoFromPreviousShifter
                    || this._currentShiftData.payload.infoFromPreviousShifter.value;
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
     * @return {'ECS'|'QC/PDP'|'SLIMOS'|'SL'|'DCS'} the report type
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
        this.data = new EosReportCreationFormData(this._reportType);
        this.data.bubbleTo(this);
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _getSerializableData() {
        return this.data._serializable();
    }
}

// eslint-disable-next-line require-jsdoc, no-unused-vars
class EosReportCreationFormData extends Observable {
    // eslint-disable-next-line require-jsdoc, constructor-super
    constructor(type) {
        super();
        this._reportType = type;

        this.shifterName = sessionService.get().name;
        this.typeSpecific = {};
        switch (type) {
            case ShiftTypes.ECS:
                this.typeSpecific = { environmentComments: {}, runComments: {} };
                break;
            case ShiftTypes.QC_PDP:
                this.typeSpecific = { runComments: {} };
                break;
            case ShiftTypes.SLIMOS:
                this.typeSpecific = null;
                break;
            case ShiftTypes.SL:
                this.typeSpecific = {
                    magnets: {
                        start: { solenoid: null, dipole: null },
                        intermediates: [],
                        end: { solenoid: null, dipole: null },
                    },
                };
                break;
            case ShiftTypes.DCS:
                this.typeSpecific = {
                    alerts: '',
                };
                break;
        }
    }

    // eslint-disable-next-line require-jsdoc
    _serializable() {
        const serializableData = {
            ...this,
        };
        delete serializableData.observers;
        delete serializableData._reportType;
        // Data processing specific to some EoS report types
        switch (this._reportType) {
            case ShiftTypes.SL:
                serializableData.typeSpecific.magnets.intermediates =
                    serializableData.typeSpecific.magnets.intermediates.filter((item) => item !== null);
        }

        return serializableData;
    }

    // eslint-disable-next-line require-jsdoc
    pushIntermidiateManget(magnetConfiguration) {
        this.typeSpecific.magnets.intermediates.push(magnetConfiguration);
        this.notify();
    }

    // eslint-disable-next-line require-jsdoc
    removeMagnet(index) {
        this.typeSpecific.magnets.intermediates[index] = null;
        this.notify();
    }
}
