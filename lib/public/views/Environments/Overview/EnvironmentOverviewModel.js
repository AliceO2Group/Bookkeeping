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

import { TimeRangeInputModel } from '../../../components/Filters/common/filters/TimeRangeInputModel.js';
import { RawTextFilterModel } from '../../../components/Filters/common/filters/RawTextFilterModel.js';
import { debounce } from '../../../utilities/debounce.js';
import { coloredEnvironmentStatusComponent } from '../ColoredEnvironmentStatusComponent.js';
import { StatusAcronym } from '../../../domain/enums/statusAcronym.mjs';
import { SelectionModel } from '../../../components/common/selection/SelectionModel.js';
import { FilterableOverviewPageModel } from '../../../models/FilterableOverviewPageModel.js';

/**
 * Environment overview page model
 */
export class EnvironmentOverviewModel extends FilterableOverviewPageModel {
    /**
     * Constructor
     * @param {Model} model global model
     * @param {string} pageIdentifier string that indicates what page this model represents
     */
    constructor(model, pageIdentifier) {
        super(
            model.router,
            pageIdentifier,
            {
                created: new TimeRangeInputModel(),
                runNumbers: new RawTextFilterModel(),
                statusHistory: new RawTextFilterModel(),
                currentStatus: new SelectionModel({
                    availableOptions: Object.keys(StatusAcronym).map((status) => ({
                        value: status,
                        label: coloredEnvironmentStatusComponent(status),
                        rawLabel: status,
                    })),
                }),
                ids: new RawTextFilterModel(),
            },
        );
    }

    /**
     * @inheritDoc
     */
    getRootEndpoint() {
        return this.buildRootEndpoint('/api/environments');
    }

    /**
     * Returns the current environments list as remote data
     *
     * @return {RemoteData} the environments list
     */
    get environments() {
        return this.items;
    }
}
