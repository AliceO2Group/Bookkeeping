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
import { textFilter } from '../../../components/Filters/common/filters/textFilter.js';
import { modeledCheckboxFilter } from '../../../components/Filters/common/filters/checkboxFilter.js';

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
        filter: ({ namesFilterModel }) => textFilter(
            namesFilterModel,
            { class: 'w-75 mt1', placeholder: 'e.g. BadPID, ...' },
        ),
        classes: 'f6',
        sortable: true,
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
        sortable: true,
        filter: ({ methodsFilterModel }) => textFilter(
            methodsFilterModel,
            { class: 'w-75 mt1', placeholder: 'e.g. Bad PID, ...' },
        ),
        classes: 'f6',
    },

    bad: {
        name: 'Bad',
        visible: true,
        sortable: true,
        filter: ({ badnessFilterModel }) => modeledCheckboxFilter(
            badnessFilterModel,
            { class: 'w-75 mt1' },
        ),
        classes: 'f6',
        format: (bad) => bad ? h('.danger', 'Yes') : h('.success', 'No'),
    },

    lastUpdatedBy: {
        name: 'Last updated by',
        visible: true,
        classes: 'f6',
        format: (lastUpdatedBy) => lastUpdatedBy?.name || '-',
    },
    updatedAt: {
        name: 'Updated at',
        visible: true,
        sortable: true,
        classes: 'f6',
        format: (timestamp, { lastUpdatedBy }) => lastUpdatedBy ? formatTimestamp(timestamp) : '-',
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
        sortable: true,
        classes: 'f6',
        format: (timestamp) => formatTimestamp(timestamp),
    },
};
