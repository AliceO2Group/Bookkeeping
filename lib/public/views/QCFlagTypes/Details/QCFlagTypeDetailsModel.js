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

import { SelectionModel } from '../../../components/common/selection/SelectionModel.js';
import { ItemDetailsModel } from '../../../models/ItemDetailsModel.js';

/**
 * Model storing a given QC Flag Type details state
 */
export class QCFlagTypeDetailsModel extends ItemDetailsModel {
    /**
     * Constructor
     */
    constructor() {
        super('/api/qualityControlFlags/types');

        this._badnessSelectionModel = new SelectionModel({
            availableOptions: [{ label: 'Bad', value: true }, { label: 'Not Bad', value: false }],
            allowEmpty: false,
            multiple: false,
            defaultSelection: [{ label: 'Bad', value: true }],
        });
        this._badnessSelectionModel.bubbleTo(this);
    }

    /**
     * Returns QC Flag Types badness selection model
     * @return {SelectionModel} QC Flag Types badness selection model
     */
    get badnessSelectionModel() {
        return this._badnessSelectionModel;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    async loadItem() {
        await super.loadItem();
        this.item.match({
            Success: (qcFlagType) => this._badnessSelectionModel.select(qcFlagType.bad),
            Other: () => null,
        });
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    resetPatch() {
        this.item.match({
            Success: (qcFlagType) => {
                this._patch = {
                    name: qcFlagType.name,
                    method: qcFlagType.method,
                    archived: qcFlagType.archived,
                    color: qcFlagType.color,
                };
            },
            Other: () => null,
        });
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    _getSerializablePatch() {
        return { ...this._patch, bad: this._badnessSelectionModel.selected[0] };
    }

    /**
     * Get current patch
     */
    get patch() {
        return this._patch;
    }
}
