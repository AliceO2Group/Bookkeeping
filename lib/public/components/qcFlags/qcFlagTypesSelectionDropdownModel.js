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
import { h, RemoteData } from '/js/src/index.js';
import { qcFlagTypesProvider } from '../../services/qcFlags/qcFlagTypesProvider.js';
import { badge } from '../common/badge.js';
import { qcFlagTypeColoredBadge } from '../../views/QcFlags/common/qcFlagTypeColoredBadge.js';

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
        // eslint-disable-next-line require-jsdoc
        const updateAvailableOptionsOnProviderNotify = () => qcFlagTypesProvider.notArchived$.getCurrent().match({
            Success: (data) => {
                this.setAvailableOptions(RemoteData.success(data.map(({ id, name, method, bad, color }) => ({
                    value: id,
                    original: { id, name, method, bad, color },
                    label: [
                        qcFlagTypeColoredBadge({ color }),
                        badge(h('span.flex-row.g1', method)),
                    ] }))));
            },
            Failure: (errors) => {
                this.setAvailableOptions(RemoteData.failure(errors));
            },
            NotAsked: () => {
                this.setAvailableOptions(RemoteData.notAsked());
            },
            Loading: () => {
                this.setAvailableOptions(RemoteData.loading());
            },
        });
        qcFlagTypesProvider.notArchived$.observe(updateAvailableOptionsOnProviderNotify);
        updateAvailableOptionsOnProviderNotify();
    }
}
