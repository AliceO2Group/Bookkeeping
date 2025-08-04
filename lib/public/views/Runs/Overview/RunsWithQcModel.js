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

import { NumericalComparisonFilterModel } from '../../../components/Filters/common/filters/NumericalComparisonFilterModel.js';
import { RunsOverviewModel } from './RunsOverviewModel.js';

/**
 * RunsWithQcModel
 *
 * Runs overview model which stores common information for all RCT runs overviews pages
 */
export class RunsWithQcModel extends RunsOverviewModel {
    /**
     * Constructor
     * @param {Model} model global model
     */
    constructor(model) {
        super(model);

        this.patchDisplayOptions({
            horizontalScrollEnabled: true,
            verticalScrollEnabled: true,
            freezeFirstColumn: true,
        });
    }

    /**
     * Register not-bad fraction detectors filtering model
     * @param {ObservableData<RemoteData<Detector>>} detectors$ detectors remote data observable
     */
    registerDetectorsNotBadFractionFilterModels(detectors$) {
        detectors$.observe((observableData) => observableData.getCurrent().apply({
            Success: (detectors) => detectors.forEach(({ id }) => {
                this._filteringModel.put(`detectorsQc[_${id}][notBadFraction]`, new NumericalComparisonFilterModel({
                    scale: 0.01,
                    integer: false,
                }));
            }),
        }));
    }
}
