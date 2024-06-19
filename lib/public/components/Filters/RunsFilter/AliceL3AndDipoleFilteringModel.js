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

import { RemoteData } from '/js/src/index.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';
import { SelectionDropdownModel } from '../../common/selection/dropdown/SelectionDropdownModel.js';

/**
 * AliceL3AndDipoleFilteringModel
 */
export class AliceL3AndDipoleFilteringModel extends SelectionDropdownModel {
    /**
     * Constructor
     */
    constructor() {
        super({ multiple: false });
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _initialize() {
        getRemoteData('/api/runs/aliceCurrentLevels').then(({ data }) => {
            this.setAvailableOptions(data.map(({ l3Level, dipoleLevel }) => ({
                value: `${l3Level}kA/${dipoleLevel}kA`,
                filteringParams: {
                    aliceL3Current: {
                        [l3Level < 0 ? '>' : '>=']: l3Level * 1000 - 500,
                        [l3Level < 0 ? '<=' : '<']: l3Level * 1000 + 500,
                    },
                },
            })));
        }, (errors) => this.setAvailableOptions(RemoteData.Failure(errors)));
    }
}
