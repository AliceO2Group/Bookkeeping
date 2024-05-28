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

import { SelectionDropdownModel } from '../components/common/selection/dropdown/SelectionDropdownModel.js';
import { dplDetectorsProvider } from '../services/detectors/dplDetectorsProvider.js';
import { getDetectorExpertRoleName } from '../utilities/getDetectorExpertRoleName.js';

const DEFAULT_ROLES_OPTIONS = [{ value: 'admin' }, { value: 'guest' }];

/**
 * Model storing state of selected Bkp roles (for TEST only)
 */
export class BkpRolesSelectionModel extends SelectionDropdownModel {
    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    constructor() {
        super({ defaultSelection: DEFAULT_ROLES_OPTIONS });
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _initialize() {
        /**
         * Update dropdown model options with DPL detector provider remote data
         * @return {void}
         */
        const update = () => this.setAvailableOptions(dplDetectorsProvider.physical$.getCurrent().match({
            Success: (detectors) => [
                ...DEFAULT_ROLES_OPTIONS,
                ...detectors.map(({ name }) => getDetectorExpertRoleName(name))
                    .map((roleName) => ({
                        value: roleName,
                        rawLabel: roleName,
                    })),
            ],
            Other: () => DEFAULT_ROLES_OPTIONS,
        }));

        setTimeout(() => {
            dplDetectorsProvider.physical$.observe(update);
            update();
        }, 1);
    }
}
