/**
 * @license
 * Copyright CERN and copyright holders of ALICE Trg. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-Trg.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { beamsTypesProvider } from '../../../services/beamsTypes/beamsTypesProvider.js';
import { SelectionModel } from '../../common/selection/SelectionModel.js';

/**
 * Beam type filter model
 */
export class BeamsTypeFilterModel extends SelectionModel {
    /**
     * Constructor
     */
    constructor() {
        let beamTypes = [];
        super({ availableOptions: beamTypes,
            defaultSelection: [],
            multiple: true,
            allowEmpty: true });

        beamsTypesProvider.items$.observe(() => {
            beamsTypesProvider.items$.getCurrent().apply({
                Success: (types) => {
                    beamTypes = types.map((type) => ({ value: String(type.beam_type) }));
                    this.setAvailableOptions(beamTypes);
                },
            });
        });
    }

    /**
     * Get normalized selected option
     */
    get normalized() {
        return this.selected.join(',');
    }

    /**
     * Reset the filter to default values
     *
     * @return {void}
     */
    resetDefaults() {
        if (!this.isEmpty) {
            this.reset();
            this.notify();
        }
    }
}
