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

/**
 * Model storing state of a selection of detectors picked from the list of all the existing detectors
 *
 * @template T
 */
export class ObservableBasedSelectionDropdownModel extends SelectionDropdownModel {
    /**
     * @callback ItemToOption
     * @param {T} item the item to convert to option
     * @return {SelectionOption} the corresponding selection option
     */

    /**
     * Constructor
     *
     * @param {ObservableData<RemoteData<T[]>>} observableItems observable remote data of items to be used as selection options
     * @param {ItemToOption} itemToOption function to map between remote data items to options
     */
    constructor(observableItems, itemToOption) {
        super({ availableOptions: RemoteData.loading() });
        observableItems.observe(() => {
            this.setAvailableOptions(observableItems.getCurrent().apply({
                Success: (items) => items.map(itemToOption),
            }));
        });
    }
}
