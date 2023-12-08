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
import { formatRunsList } from '../../Runs/format/formatRunsList.js';
import { displayEnvironmentStatusHistory } from '../format/displayEnvironmentStatusHistory.js';
import { displayEnvironmentStatus } from '../format/displayEnvironmentStatus.js';
import { displayEnvironmentInfologgerLinks } from '../format/displayEnvironmentInfologgerLinks.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';

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
        name: 'Current Status',
        visible: true,
        sortable: false,
        size: 'w-20',
        noEllipsis: true,
        format: (_, environment) => displayEnvironmentStatus(environment),
    },
    statusHistory: {
        name: 'Status History',
        visible: true,
        sortable: false,
        size: 'w-30',
        title: true,
        format: (_, environment) => displayEnvironmentStatusHistory(environment),
        balloon: true,
    },
    runs: {
        name: 'Runs',
        visible: true,
        sortable: false,
        size: 'w-10',
        title: true,
        format: formatRunsList,
        balloon: true,
    },
    infologger: {
        name: 'Infologger',
        visible: true,
        sortable: false,
        classes: 'w-10 text-center',
        format: (_, environment) => displayEnvironmentInfologgerLinks(environment),
    },
};
