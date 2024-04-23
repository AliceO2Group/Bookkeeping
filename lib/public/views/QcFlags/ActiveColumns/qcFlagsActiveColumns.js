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

import { iconWarning } from '/js/src/index.js';
import { tooltip } from '../../../components/common/popover/tooltip.js';
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';
import { qcFlagTypeColoredBadge } from '../common/qcFlagTypeColoredBadge.js';
import { formatFloat } from '../../../utilities/formatting/formatFloat.js';

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

    effectivePart: {
        name: 'eff. part (%)',
        visible: true,
        format: (_, { ineffectivenessPeriods, from, to }) => {
            const sumOfIneffectivenessPeriods = ineffectivenessPeriods?.reduce((acc, { from, to }) => acc + (to - from), 0);
            const v = 100 * (1 - sumOfIneffectivenessPeriods / (to - from));
            return v > 0
                ? formatFloat(
                    v,
                    { precision: 1 },
                )
                : tooltip(iconWarning(), 'Flag is discarded');
        },
    },
    comment: {
        name: 'Comment',
        visible: true,
    },

    createdBy: {
        name: 'Created by',
        visible: true,
        format: (createdBy) => createdBy?.name || '-',
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
