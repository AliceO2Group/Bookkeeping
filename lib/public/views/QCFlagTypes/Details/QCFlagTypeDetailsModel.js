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
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    resetPatch() {
        this.item.match({
            Success: (qcFlagType) => {
                this.patch = {
                    name: qcFlagType.name,
                    method: qcFlagType.method,
                    bad: qcFlagType.bad,
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
        return { ...this.patch };
    }
}
