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

import { ObservableBasedSelectionDropdownModel } from '../../detector/ObservableBasedSelectionDropdownModel.js';
import { keyToOption } from './keyToOption.js';

/**
 * Model storing state of a single key picked from the list of all the keys found in the environments raw configuration
 */
export class KeyFilterModel extends ObservableBasedSelectionDropdownModel {
    /**
     * Constructor
     *
     * @param {ObservableData<RemoteData<string[], ApiError>>} keys$ observable remote data of keys list
     */
    constructor(keys$) {
        super(keys$, keyToOption, { multiple: false });
    }
}
