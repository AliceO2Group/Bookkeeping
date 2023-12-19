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

import { Observable, RemoteData, sessionService } from '@aliceo2/web-ui-frontend';
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
            case ShiftTypes.SLIMOS:
                this.data.typeSpecific = null;
                break;
            case ShiftTypes.SL:
                // eslint-disable-next-line no-case-declarations
                const magnetConfigurationModel = new MagnetsConfigurationFormModel();
                magnetConfigurationModel.bubbleTo(this);
                this.data.typeSpecific = {
                    magnets: magnetConfigurationModel,
                };
                break;
            case ShiftTypes.DCS:
                this.data.typeSpecific = {
                    alerts: '',
                };
                break;
        }
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _getSerializableData() {
        let ret = {
            ...this.data,
        };

        // Data processing specific to some EoS report types
        switch (this._reportType) {
            case ShiftTypes.SL:
                ret = {
                    ...ret,
                    typeSpecific: {
                        ...ret.typeSpecific,
                        magnets: ret.typeSpecific.magnets.normalize(),
                    },
                };
        }

        return ret;
    }
}

/**
 * Model for form to fill in magnets configuration
 */
export class MagnetsConfigurationFormModel extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();

        /**
         * @type {MagnetConfiguration}
         * @private
         */
        this._start = { solenoid: '', dipole: '' };

        /**
         * @type {array<MagnetConfigurationSnapshot|null>[]}
         * @private
         */
        this._intermediates = [];

        /**
         * @type {MagnetConfiguration}
         * @private
         */
        this._end = { solenoid: '', dipole: '' };
    }

    /**
     * Return the start magnet configuration
     *
     * @return {MagnetConfiguration} the start configuration
     */
    get start() {
        return this._start;
    }

    /**
     * Add a new empty magnet intermediate value
     *
     * @return {void}
     */
    addIntermediate() {
        this._intermediates.push({
            timestamp: undefined,
            magnetConfiguration: { solenoid: '', dipole: '' },
        });
        this.notify();
    }

    /**
     * Drop the intermediate magnet configuration at the given key
     *
     * @param {number} key the key of the intermediate value
     * @return {void}
     */
    dropIntermediate(key) {
        this._intermediates[key] = null;
        this.notify();
    }

    /**
     * Returns the intermediates magnet configurations
     *
     * @return {array<MagnetConfigurationSnapshot|null>[]} the magnet configurations
     */
    get intermediates() {
        return this._intermediates;
    }

    /**
     * Return the final magnets configuration
     *
     * @return {MagnetConfiguration} the final configuration
     */
    get end() {
        return this._end;
    }

    /**
     * Returns the normalized magnet configuration
     *
     * @return {{start: MagnetConfiguration, end: MagnetConfiguration, intermediates: Array<MagnetConfigurationSnapshot>[]}} the configuration
     */
    normalize() {
        return {
            start: this._start,
            intermediates: this.intermediates.filter((item) => item !== null),
            end: this._end,
        };
    }
}
