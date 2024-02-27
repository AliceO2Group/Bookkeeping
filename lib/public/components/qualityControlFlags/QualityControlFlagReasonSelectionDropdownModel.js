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
import { qualityControlFlagReasonsProvider } from '../../services/qualityControlFlags/qualityControlFlagsReasonsProvider.js';
import { badge } from '../common/badge.js';
import { flagColoredBadge } from '../../views/QualityControlFlags/common/flagColoreBadge.js';

/**
 * Model storing state of a selection of tags picked from the list of all the existing tags
 */
export class QualityControlFlagReasonSelectionDropdownModel extends SelectionDropdownModel {
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
        qualityControlFlagReasonsProvider.getAll()
            .then(
                (data) => {
                    this.availableOptions = RemoteData.success(data.map(({ id, name, method, bad }) => ({
                        value: id,
                        original: { id, name, method, bad },
                        label: [
                            flagColoredBadge({ name, bad }),
                            badge(h('span.flex-row.g1', method)),
                        ] })));
                },
                (errors) => {
                    this.availableOptions = RemoteData.failure(errors);
                },
            );
    }
}