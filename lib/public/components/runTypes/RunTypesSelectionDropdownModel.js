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
import { runTypeToOption } from './runTypeToOption.js';
import { runTypesProvider } from '../../services/runTypes/runTypesProvider.js';

/**
 * Model storing state of a selection of run types picked from the list of all the existing run types
 */
export class RunTypesSelectionDropdownModel extends SelectionDropdownModel {
    /**
     * Constructor
     */
    constructor() {
        super({ availableOptions: RemoteData.notAsked() });
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _initialize() {
        runTypesProvider.getAll().then(
            (runTypes) => {
                this.availableOptions = RemoteData.success(runTypes.map(runTypeToOption));
            },
            (errors) => {
                this.availableOptions = RemoteData.failure(errors);
            },
        );
    }
}
