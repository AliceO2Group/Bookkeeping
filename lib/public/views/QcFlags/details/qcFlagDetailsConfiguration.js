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
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';
import { qcFlagTypeColoredBadge } from '../../../components/qcFlags/qcFlagTypeColoredBadge.js';

/**
 * Display configuration of given QC flag details
 */
export const qcFlagDetailsConfiguration = {
    id: {
        name: 'Id',
        visible: true,
    },
    runNumber: {
        name: 'Run',
        visible: true,
        format: (runNumber) => frontLink(runNumber, 'run-detail', { runNumber }),
    },
    flagType: {
        name: 'Type',
        visible: true,
        format: (flagType) => qcFlagTypeColoredBadge(flagType),
    },
    from: {
        name: 'From',
        visible: true,
        format: (timestamp) => formatTimestamp(timestamp),
    },
    to: {
        name: 'To',
        visible: true,
        format: (timestamp) => formatTimestamp(timestamp),
    },
    verified: {
        name: 'Verified',
        format: (_, { verifications }) => verifications?.length > 0
            ? h('.success', 'Yes')
            : h('.warning', 'No'),
    },
    createdBy: {
        name: 'Created by',
        visible: true,
        format: (user) => user?.name,
    },
    createdAt: {
        name: 'Created at',
        visible: true,
        format: (timestamp) => formatTimestamp(timestamp, true),
    },
};
