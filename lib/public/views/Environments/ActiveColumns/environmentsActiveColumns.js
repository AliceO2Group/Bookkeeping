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
import { displayEnvironmentStatus } from '../format/displayEnvironmentStatus.js';
import { infoLoggerButtonGroup } from '../../../components/common/selection/infoLoggerButtonGroup/infoLoggerButtonGroup.js';

/**
 * List of active columns for a generic Environments component
 *
 * @param {EnvironmentOverviewModel} overviewModel the environment's overview model
 * @return {Component} the environmentsActiveColumns component
 */
export const environmentsActiveColumns = (overviewModel) => ({
    id: {
        name: 'Id',
        size: 'w-10 f6 w-wrapped',
        visible: true,
        primary: true,
        title: true,
        format: (environment) => infoLoggerButtonGroup(overviewModel, { environmentId: environment }),
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
        size: 'w-10',
        noEllipsis: true,
        format: (_, environment) => displayEnvironmentStatus(environment),
    },
    statusMessage: {
        name: 'Status Message',
        visible: true,
        sortable: false,
        size: 'w-40',
        title: true,
        format: (message) => message || '-',
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
});
