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

import { SelectionDropdownModel } from '../common/selection/dropdown/SelectionDropdownModel.js';
import { RemoteData } from '/js/src/index.js';
import { qcFlagTypesProvider } from '../../services/qcFlags/qcFlagTypesProvider.js';
import { qcFlagTypeColoredBadge } from './qcFlagTypeColoredBadge.js';

/**
 * Model storing state of a selection of QC flag types picked from the list of all the existing types
 */
export class QcFlagTypesSelectionDropdownModel extends SelectionDropdownModel {
    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    constructor(configuration) {
        super({
            availableOptions: RemoteData.notAsked(),
            ...configuration,
        });
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _initialize() {
        /**
         * Update dropdown model options with QC flag types provider remote data
         * @return {void}
         */
        const update = () => this.setAvailableOptions(qcFlagTypesProvider.notArchived$.getCurrent().apply({
            Success: (qcFlagTypes) => qcFlagTypes.map((qcFlagType) => ({
                value: qcFlagType.id,
                label: qcFlagTypeColoredBadge(qcFlagType),
                rawLabel: qcFlagType.name,
            })),
        }));
        qcFlagTypesProvider.notArchived$.observe(update);
        update();
    }
}
