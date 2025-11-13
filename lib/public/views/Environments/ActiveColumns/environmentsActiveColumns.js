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

import { CopyToClipboardComponent, h } from '/js/src/index.js';
import { iconPlus } from '/js/src/icons.js';
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';
import { formatRunsList } from '../../Runs/format/formatRunsList.js';
import { displayEnvironmentStatus } from '../format/displayEnvironmentStatus.js';
import { buttonLinkWithDropdown } from '../../../components/common/selection/infoLoggerButtonGroup/buttonLinkWithDropdown.js';
import { infologgerLinksComponents } from '../../../components/common/externalLinks/infologgerLinksComponents.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';;
import { coloredEnvironmentStatusComponent } from '../ColoredEnvironmentStatusComponent.js';
import { environmentStatusHistoryLegendComponent } from '../../../components/environments/environmentStatusHistoryComponent.js';
import { infoTooltip } from '../../../components/common/popover/infoTooltip.js';
import { aliEcsEnvironmentLinkComponent } from '../../../components/common/externalLinks/aliEcsEnvironmentLinkComponent.js';
import { StatusAcronym } from '../../../domain/enums/statusAcronym.mjs';

/**
 * List of active columns for a generic Environments component
 */
export const environmentsActiveColumns = {
    id: {
        name: 'Id',
        size: 'w-10 f6 w-wrapped',
        visible: true,
        primary: true,
        format: (environmentId, { status, runs }) => buttonLinkWithDropdown(
            environmentId,
            'env-details',
            { environmentId },
            [
                h(CopyToClipboardComponent, { value: environmentId, id: environmentId }, 'Copy Environment Id'),
                ...infologgerLinksComponents({ environmentId }),
                status === 'RUNNING'
                    ? aliEcsEnvironmentLinkComponent(environmentId)
                    : null,
                frontLink(
                    h('span.flex-row.items-center.g1', [iconPlus(), 'Add log']),
                    'log-create',
                    { environmentIds: [environmentId], runNumbers: runs.length > 0 ? runs.map((run) => run.runNumber) : [] },
                    { id: 'add-log-link', class: 'btn btn-primary h2' },
                ),
            ],
        ),
    },
    runs: {
        name: 'Runs',
        visible: true,
        sortable: false,
        size: 'w-10',
        format: formatRunsList,
        balloon: true,
    },
    updatedAt: {
        name: 'Last Update',
        visible: true,
        sortable: false,
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
    historyItems: {
        name: h('.flex-row.g2.items-center', ['Status History', infoTooltip(environmentStatusHistoryLegendComponent())]),
        visible: true,
        sortable: false,
        size: 'w-20',
        format: (historyItems) => historyItems
            .flatMap(({ status }) => [
                '-',
                coloredEnvironmentStatusComponent(status, StatusAcronym[status]),
            ]).slice(1),
        balloon: true,
    },
};
