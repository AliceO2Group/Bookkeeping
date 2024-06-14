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
        this.setAvailableOptions([
            {
                value: '-30kA',
                filteringParams: {
                    aliceL3Current: {
                        '>': -30500,
                        '<=': -29500,
                    },
                },
            },
            {
                value: '-12kA',
                filteringParams: {
                    aliceL3Current: {
                        '>': -12500,
                        '<': -11500,
                    },
                },
            },
            {
                value: '0kA',
                filteringParams: {
                    aliceL3Current: {
                        '>': -500,
                        '<': 500,
                    },
                },
            },
            {
                value: '12kA',
                filteringParams: {
                    aliceL3Current: {
                        '>=': 11500,
                        '<': 12500,
                    },
                },
            },
            {
                value: '30kA',
                filteringParams: {
                    aliceL3Current: {
                        '>=': 29500,
                        '<': 30500,
                    },
                },
            },
        ]);
    }
}
