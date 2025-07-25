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
import { detectorsProvider } from '../services/detectors/detectorsProvider.js';
import { BkpRoles } from '../domain/enums/BkpRoles.js';
import { getRoleForDetector } from '../utilities/getRoleForDetector.js';

const DEFAULT_ROLES_OPTIONS = [{ value: BkpRoles.ADMIN }];
const NON_DETECTOR_QC_ROLES = [{ value: BkpRoles.GAQ }, { value: BkpRoles.DPG_ASYNC_QC_ADMIN }];

/**
 * Model storing state of selected Bkp roles
 */
export class UserRoleSelectionModel extends SelectionDropdownModel {
    /**
     * @inheritDoc
     */
    constructor() {
        super({ defaultSelection: DEFAULT_ROLES_OPTIONS });
    }

    /**
     * @inheritDoc
     */
    _initialize() {
        /**
         * Update dropdown model options with DPL detector provider remote data
         * @return {void}
         */
        const update = () => this.setAvailableOptions(detectorsProvider.qc$.getCurrent().match({
            Success: (detectors) => [
                ...DEFAULT_ROLES_OPTIONS,
                ...NON_DETECTOR_QC_ROLES,
                ...detectors.map(({ name }) => ({ value: getRoleForDetector(name) })),
            ],
            Other: () => DEFAULT_ROLES_OPTIONS,
        }));

        detectorsProvider.qc$.observe(update);
        update();
    }
}
