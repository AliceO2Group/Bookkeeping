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
import { flagColoredBadge } from '../format/flagColoreBadge.js';

/**
 * List of active columns for a generic periods table
 */
export const qualityControlFlagsActiveColumns = {
    timeStart: {
        name: 'Start',
        visible: true,
        format: (timeStart) => formatTimestamp(timeStart, false),
    },

    timeEnd: {
        name: 'End',
        visible: true,
        format: (timeEnd) => formatTimestamp(timeEnd, false),
    },

    flagReason: {
        name: 'Reason',
        visible: true,
        format: (flagReason) => h('.flex-row.g1', [flagColoredBadge(flagReason.name), flagReason.name]),
    },

    comment: {
        name: 'Comment',
        visible: true,
    },

    user: {
        name: 'Created by',
        visible: true,
        format: (_, { user }) => user?.name || '-',
    },

    verifications: {
        name: 'Verification',
        visible: true,
        format: (verifications) => verifications?.length > 0 ? h('.success', 'Yes') : 'No',
    },

    createdAt: {
        name: 'Created at',
        visible: true,
        format: (createdAt) => formatTimestamp(createdAt, false),
    },
};
