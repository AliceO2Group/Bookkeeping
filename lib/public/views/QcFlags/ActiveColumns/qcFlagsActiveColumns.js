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

import { h } from '/js/src/index.js';
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';
import { qcFlagColoredBadge } from '../common/qcFlagColoredBadge.js';

/**
 * Active columns configuration for QC flags pages
 */
export const qcFlagsActiveColumns = {
    id: {
        name: 'Id',
        visible: false,
    },

    flagType: {
        name: 'Type',
        visible: true,
        format: (flagType) => h('.flex-row.g1', [flagType.name, qcFlagColoredBadge(flagType)]),
    },
    from: {
        name: 'From',
        visible: true,
        format: (timestamp) => timestamp ?
            formatTimestamp(timestamp, false)
            : 'Whole run coverage',
    },

    to: {
        name: 'To',
        visible: true,
        format: (timestamp) => timestamp ?
            formatTimestamp(timestamp, false)
            : 'Whole run coverage',
    },

    comment: {
        name: 'Comment',
        visible: true,
    },

    createdBy: {
        name: 'Created by',
        visible: true,
        format: (_, { createdBy }) => createdBy?.name || '-',
    },

    createdAt: {
        name: 'Created at',
        visible: true,
        format: (timestamp) => formatTimestamp(timestamp, false),
    },

    updatedAt: {
        name: 'Updated at',
        visible: true,
        format: (timestamp) => formatTimestamp(timestamp, false),
    },
};
