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
import { formatRunsList } from '../../Runs/format/formatRunsList.js';
import { displayEnvironmentStatus } from '../format/displayEnvironmentStatus.js';
import { buttonLinkWithDropdown } from '../../../components/common/selection/infoLoggerButtonGroup/buttonLinkWithDropdown.js';
import { CopyToClipboardComponent } from '../../../components/common/selection/infoLoggerButtonGroup/CopyToClipboardComponent.js';
import { infologgerLinksComponents } from '../../../components/common/infologger/infologgerLinksComponents.js';
import { displayEnvironmentStatusHistory } from '../format/displayEnvironmentStatusHistory.js';

/**
 * List of active columns for a generic Environments component
 */
export const environmentsActiveColumns = {
    id: {
        name: 'Id',
        size: 'w-10 f6 w-wrapped',
        visible: true,
        primary: true,
        title: true,
        format: (environmentId) => buttonLinkWithDropdown(
            environmentId,
            'env-details',
            { environmentId },
            [
                h(CopyToClipboardComponent, { value: environmentId, id: environmentId }, 'Copy Environment Id'),
                ...infologgerLinksComponents({ environmentId }),
            ],
        ),
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
    updatedAt: {
        name: 'Updated At',
        visible: true,
        sortable: false,
        title: true,
        size: 'w-10',
        format: (timestamp) => formatTimestamp(timestamp, false),
    },
    createdAt: {
        name: 'Created At',
        visible: true,
        sortable: false,
        title: true,
        size: 'w-10',
        format: (timestamp) => formatTimestamp(timestamp, false),
    },
    status: {
        name: 'Current Status',
        visible: true,
        sortable: false,
        size: 'w-10',
        noEllipsis: true,
        format: (_, environment) => displayEnvironmentStatus(environment),
    },
    statusHistory: {
        name: 'Status History',
        visible: true,
        sortable: false,
        size: 'w-20',
        title: true,
        format: (_, environment) => displayEnvironmentStatusHistory(environment),
        balloon: true,
    },
};
