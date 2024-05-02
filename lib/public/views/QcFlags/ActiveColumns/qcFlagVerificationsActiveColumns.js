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

import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';

/**
 * List of active columns for a generic QC flags verifications table
 */
export const qcFlagsVerificationsActiveColumns = {
    id: {
        visible: false,
    },

    createdBy: {
        name: 'Verified by',
        visible: true,
        format: (createdBy) => createdBy?.name || '-',
        classes: 'w-20',
    },

    createdAt: {
        name: 'Verified at',
        visible: true,
        format: (createdAt) => formatTimestamp(createdAt, false),
        classes: 'w-15',
    },

    comment: {
        name: 'Comment',
        visible: true,
        balloon: true,
    },
};
