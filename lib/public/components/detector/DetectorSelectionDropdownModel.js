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
import { createDetectorsProviderInstance } from '../../services/detectors/detectorsProvider.js';

/**
 * Model storing state of a selection of detectors picked from the list of all the existing detectors
 */
export class DetectorSelectionDropdownModel extends SelectionDropdownModel {
    /**
     * Constructor
     */
    constructor() {
        super({ availableOptions: RemoteData.loading() });
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _initialize() {
        this._detectorsProvider = createDetectorsProviderInstance();
        this._detectorsProvider.bubbleTo(this.visualChange$);
        this._detectorsProvider.fetch()
            .then(() => {
                const { detectors } = this._detectorsProvider;
                this.availableOptions = detectors.match({
                    Success: (payload) => RemoteData.success(payload.map(payload.map(({ name }) => ({ value: name })))),
                    Failure: (payload) => RemoteData.failure(payload),
                    NotAsked: () => RemoteData.notAsked(),
                    Loading: () => RemoteData.loading(),
                });
            });
    }
}
