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
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { formatRunsList } from '../../Runs/format/formatRunsList.js';

/**
 * List of active columns for a generic Environments component
 */
export const environmentsActiveColumns = {
    id: {
        name: 'Id',
        size: 'w-10',
        visible: true,
        primary: true,
        title: true,
        format: (id) => frontLink(id, 'env-details', { environmentId: id }),
    },
    updatedAt: {
        name: 'Updated At',
        visible: true,
        sortable: false,
        title: true,
        size: 'w-15',
        format: (timestamp) => formatTimestamp(timestamp),
    },
    createdAt: {
        name: 'Created At',
        visible: true,
        sortable: false,
        title: true,
        size: 'w-15',
        format: (timestamp) => formatTimestamp(timestamp),
    },
    status: {
        name: 'Status',
        visible: true,
        sortable: false,
        title: true,
        size: 'w-10',
    },
    statusMessage: {
        name: 'Status Message',
        visible: true,
        sortable: false,
        size: 'w-45',
        title: true,
        format: (message) =>
            message ? message : '-',
        balloon: true,
    },
    runs: {
        name: 'Runs',
        visible: true,
        sortable: false,
        size: 'w-5',
        title: true,
        format: formatRunsList,
        balloon: true,
    },
};
