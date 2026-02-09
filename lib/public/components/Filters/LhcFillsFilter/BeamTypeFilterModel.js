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

import { beamTypesProvider } from '../../../services/beamTypes/beamTypesProvider.js';
import { SelectionFilterModel } from '../common/filters/SelectionFilterModel.js';

/**
 * Beam type filter model
 */
export class BeamTypeFilterModel extends SelectionFilterModel {
    /**
     * Constructor
     */
    constructor() {
        super({});

        beamTypesProvider.items$.observe(() => {
            beamTypesProvider.items$.getCurrent().apply({
                Success: (types) => {
                    const beamTypes = types.map((type) => ({ value: type.beam_type }));
                    this._selectionModel.setAvailableOptions(beamTypes);
                },
            });
        });
    }
}
