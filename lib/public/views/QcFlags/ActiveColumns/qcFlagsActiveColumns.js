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
import { qcFlagTypeColoredBadge } from '../../../components/qcFlags/qcFlagTypeColoredBadge.js';
import { formatQcFlagCreatedBy } from '../format/formatQcFlagCreatedBy.js';

/**
 * Active columns configuration for QC flags table
 */
export const qcFlagsActiveColumns = {
    flagType: {
        name: 'Type',
        visible: true,
        format: (flagType) => qcFlagTypeColoredBadge(flagType),
    },

    from: {
        name: 'From',
        visible: true,
        format: (timestamp) => timestamp
            ? formatTimestamp(timestamp, false)
            : 'Whole run coverage',
    },

    to: {
        name: 'To',
        visible: true,
        format: (timestamp) => timestamp
            ? formatTimestamp(timestamp, false)
            : 'Whole run coverage',
    },

    comment: {
        name: 'Comment',
        visible: true,
    },

    verified: {
        name: 'Verified',
        visible: true,
        format: (_, { verifications }) => verifications?.length > 0
            ? h('.success', 'Yes')
            : h('.warning', 'No'),
    },

    createdBy: {
        name: 'Created by',
        visible: true,
        format: (_, qcFlag) => formatQcFlagCreatedBy(qcFlag),
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
