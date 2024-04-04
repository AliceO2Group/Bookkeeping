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
import { CreationModel } from '../../../models/CreationModel.js';

/**
 * @typedef QcFlagTypeCreationFormData
 * @property {string} name
 * @property {string} method
 * @property {boolean} bad
 * @property {string} color
 */

/**
 * Model class storing the QC Flag Type creation state
 */
export class QcFlagTypeCreationModel extends CreationModel {
    /**
     * Constructor
     * @param {function} onCreationSuccess function called when the QC Flag Type creation is successful,
     * passing the created QC Flag Type ID as parameter
     */
    constructor(onCreationSuccess) {
        super('/api/qcflagTypes', ({ id }) => onCreationSuccess(id));
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
            name: '',
            method: '',
            color: null,
            bad: true,
        };
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _getSerializableData() {
        return { ...this.formData };
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    isValid() {
        return this.formData.name.length > 0 && this.formData.method.length > 0;
    }
}
