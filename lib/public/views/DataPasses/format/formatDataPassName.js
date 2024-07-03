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

import { badge } from '../../../components/common/badge.js';
import { tooltip } from '../../../components/common/popover/tooltip.js';
import { h, iconDelete } from '/js/src/index.js';

/**
 * Render data pass name display
 *
 * @param {DataPass} dataPass data pass
 * @return {Component} data pass name display
 */
export const formatDataPassName = ({ name, versions }) => {
    if (versions?.every(({ deletedFromMonAlisa }) => deletedFromMonAlisa)) {
        return badge(
            h('.flex-row.g1', [
                tooltip(
                    iconDelete(),
                    'The production was removed from MonALISA',
                ),
                name,
            ]),
            { color: '#4caf50' },
        );
    } else if (versions?.some(({ deletedFromMonAlisa }) => deletedFromMonAlisa)) {
        return h('.flex-row.g1', [
            tooltip(
                iconDelete(),
                'Part of the production was removed from MonALISA',
            ),
            h('.success', name),
        ]);
    } else {
        return name;
    }
};
