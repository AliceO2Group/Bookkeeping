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

import { SortModel } from '../../../components/common/table/SortModel.js';
import { OverviewPageModel } from '../../../models/OverviewModel.js';
import { buildUrl } from '../../../utilities/fetch/buildUrl.js';

/**
 * QCFlagTypesOverviewModel
 */
export class QCFlagTypesOverviewModel extends OverviewPageModel {
    /**
     * Constructor
     */
    constructor() {
        super();

        this._sortModel = new SortModel();
        this._sortModel.observe(() => {
            this._pagination.silentlySetCurrentPage(1);
            this.load();
        });
        this._sortModel.visualChange$.bubbleTo(this);
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        const params = {};
        const { appliedOn: sortOn, appliedDirection: sortDirection } = this._sortModel;
        if (sortOn && sortDirection) {
            params[`sort[${sortOn}]`] = sortDirection;
        }
        return buildUrl('/api/qualityControlFlags/types', params);
    }

    /**
     * Returns the model handling the overview page table sort
     *
     * @return {SortModel} the sort model
     */
    get sortModel() {
        return this._sortModel;
    }
}
