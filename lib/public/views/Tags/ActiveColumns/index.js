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

import { formatTimestamp } from '../../../utilities/formatTimestamp.js';

/**
 * Method to retrieve the list of active columns for a generic table component
 * @param {Object} model The global model object
 * @return {Object} A collection of columns with parameters for the Tag table
 */
const activeColumns = () => ({
    id: {
        visible: false,
        primary: true,
    },
    text: {
        name: 'Name',
        visible: true,
        classes: 'w-40 f6',
        sortable: false,
        inlineFilter: { onChange: (partialText, model) => model.tags.setPartialTextFilter(partialText), placeholder: 'Filter by name' },
    },
    lastEditedName: {
        name: 'Last Edited by',
        visible: true,
        classes: 'w-10 f6',
        format: (name) => name || '-',
    },
    updatedAt: {
        name: 'Updated at',
        visible: true,
        classes: 'w-10 f6',
        format: (timestamp) => formatTimestamp(timestamp),
    },
    mattermost: {
        name: 'Mattermost',
        visible: true,
        classes: 'w-20 f6',
        format: (mattermost) => mattermost || '-',
        sortable: false,
    },
    email: {
        name: 'Email',
        visible: true,
        classes: 'w-20 f6',
        format: (email) => email || '-',
        sortable: false,
    },
});

export default activeColumns;
