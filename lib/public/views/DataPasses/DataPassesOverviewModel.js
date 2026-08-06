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
import { SelectionModel } from '../../components/common/selection/SelectionModel.js';
import { TextTokensFilterModel } from '../../components/Filters/common/filters/TextTokensFilterModel.js';
import { NON_PHYSICS_PRODUCTIONS_NAMES_WORDS } from '../../domain/enums/NonPhysicsProductionsNamesWords.js';
import { FilterableOverviewPageModel } from '../../models/FilterableOverviewPageModel.js';

/**
 * Data Passes overview model
 */
export class DataPassesOverviewModel extends FilterableOverviewPageModel {
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
                permittedNonPhysicsNames: new SelectionModel({
                    availableOptions: NON_PHYSICS_PRODUCTIONS_NAMES_WORDS.map((word) => ({ label: word.toUpperCase(), value: word })),
                }),
            },
        );
    }
}
