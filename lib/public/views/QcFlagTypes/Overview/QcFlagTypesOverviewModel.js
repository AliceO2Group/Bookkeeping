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

import { TextTokensFilterModel } from '../../../components/Filters/common/filters/TextTokensFilterModel.js';
import { RadioButtonFilterModel } from '../../../components/Filters/common/RadioButtonFilterModel.js';
import { FilterableOverviewPageModel } from '../../../models/FilterableOverviewPageModel.js';

/**
 * QcFlagTypesOverviewModel
 */
export class QcFlagTypesOverviewModel extends FilterableOverviewPageModel {
    /**
     * Constructor
     * @param {QueryRouter} router router that controls the application's page navigation
     * @param {string} pageIdentifier string that indicates what page this model represents
     */
    constructor(router, pageIdentifier) {
        super(
            router,
            pageIdentifier,
            {
                names: new TextTokensFilterModel(),
                methods: new TextTokensFilterModel(),
                bad: new RadioButtonFilterModel([{ label: 'Any' }, { label: 'Bad', value: true }, { label: 'Not Bad', value: false }]),
            },
        );
    }

    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        return this.buildRootEndpoint('/api/qcFlagTypes');
    }
}
