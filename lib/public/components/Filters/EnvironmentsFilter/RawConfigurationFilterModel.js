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

import { FilterModel } from '../common/FilterModel.js';
import { KeyFilterModel } from './KeyFilterModel.js';
import { RawTextFilterModel } from '../common/filters/RawTextFilterModel.js';

/**
 * Model for filtering environments by raw configuration key-value pairs
 */
export class RawConfigurationFilterModel extends FilterModel {
    /**
     * Constructor
     *
     * @param {ObservableData<RemoteData<string[], ApiError>>} configurationKeys$ observable remote data of the existing configuration keys
     */
    constructor(configurationKeys$) {
        super();

        this._keyModel = new KeyFilterModel(configurationKeys$);
        this._valueModel = new RawTextFilterModel();

        this._addSubmodel(this._keyModel);
        this._addSubmodel(this._valueModel);
    }

    /**
     * @inheritDoc
     */
    reset() {
        this._keyModel.reset();
        this._valueModel.reset();
    }

    /**
     * @inheritDoc
     */
    get isEmpty() {
        return this.key === '' && this.value === '';
    }

    /**
     * Returns the normalized value as an object with key and value properties, each one only if filled (without key, the value is
     * searched anywhere in the configuration)
     *
     * @return {object} the normalized filter value
     */
    get normalized() {
        const result = {};
        if (this.key) {
            result.key = this.key;
        }
        if (this.value) {
            result.value = this.value;
        }
        return result;
    }

    /**
     * @inheritDoc
     */
    set normalized({ key = '', value = '' } = {}) {
        this._keyModel.normalized = key;
        this._valueModel.normalized = value;
    }

    /**
     * Returns the currently selected key, empty if none
     *
     * @return {string} the key
     */
    get key() {
        return this._keyModel.selected[0] ?? '';
    }

    /**
     * Returns the currently typed in value
     *
     * @return {string} the value
     */
    get value() {
        return this._valueModel.value.trim();
    }

    /**
     * Returns the key filter model
     *
     * @return {KeyFilterModel} the key filter model
     */
    get keyModel() {
        return this._keyModel;
    }

    /**
     * Returns the value filter model
     *
     * @return {RawTextFilterModel} the value filter model
     */
    get valueModel() {
        return this._valueModel;
    }
}
