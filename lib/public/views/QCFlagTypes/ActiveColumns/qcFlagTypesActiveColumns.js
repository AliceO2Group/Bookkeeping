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
import { badge } from '../../../components/common/badge.js';
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';

/**
 * List of active columns for a QC Flag Types table
 */
export const qcFlagTypesActiveColumns = {
    id: {
        visible: false,
        primary: true,
    },
    name: {
        name: 'Name',
        visible: true,
        classes: 'f6',
        format: (name, { color, archived }) => badge(
            h(
                'span.flex-row.g1',
                name,
            ),
            { color, outline: archived },
        ),
    },
    method: {
        name: 'Method',
        visible: true,
        classes: 'f6',
    },

    lastUpdatedBy: {
        name: 'Last updated at',
        visible: true,
        classes: 'f6',
        format: (lastUpdatedBy) => lastUpdatedBy?.name || '-',
    },
    updatedAt: {
        name: 'Updated at',
        visible: true,
        classes: 'f6',
        format: (timestamp) => formatTimestamp(timestamp),
    },

    createdBy: {
        name: 'Created by',
        visible: true,
        classes: 'f6',
        format: (createBy) => createBy?.name || '-',
    },
    createdAt: {
        name: 'Created at',
        visible: true,
        classes: 'f6',
        format: (timestamp) => formatTimestamp(timestamp),
    },
};
