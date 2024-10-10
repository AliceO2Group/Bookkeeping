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

import { textFilter } from '../../../components/Filters/common/filters/textFilter.js';
import { absoluteFrontLink } from '../../../components/common/navigation/absoluteFrontLink.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { externalLinks } from '../../../components/common/navigation/externalLinks.js';
import { formatItemsCount } from '../../../utilities/formatting/formatItemsCount.js';
import { formatSizeInBytes } from '../../../utilities/formatting/formatSizeInBytes.js';
import { badge } from '../../../components/common/badge.js';

/**
 * List of active columns for a generic simulation passes table
 */
export const simulationPassesActiveColumns = {
    name: {
        name: 'Name',
        visible: true,
        sortable: true,
        filter: ({ namesFilterModel }) => textFilter(
            namesFilterModel,
            { class: 'w-75 mt1', placeholder: 'e.g. LHC23k5, ...' },
        ),
        classes: 'w-10 f6',
    },

    associatedRuns: {
        name: 'Runs',
        visible: true,
        format: (_, { id, runsCount }) =>
            runsCount === 0
                ? 'No runs'
                : frontLink(
                    badge(runsCount),
                    'runs-per-simulation-pass',
                    { simulationPassId: id },
                ),
        classes: 'w-10 f6',
    },

    associatedDataPasses: {
        name: 'Anchorage',
        visible: true,
        format: (_, { id, dataPassesCount }) =>
            dataPassesCount === 0
                ? 'No anchorage'
                : frontLink(
                    badge(dataPassesCount),
                    'data-passes-per-simulation-pass-overview',
                    { simulationPassId: id },
                ),
        classes: 'w-10 f6',
    },

    description: {
        name: 'Description',
        visible: true,
        sortable: false,
        balloon: true,
    },

    jiraId: {
        name: 'Jira',
        visible: true,
        format: (jiraId) => absoluteFrontLink(jiraId, `${externalLinks.ALICE_JIRA}/browse/${jiraId}`, { target: '_blank' }) ?? '-',
        sortable: true,
        classes: 'w-5 f6',
    },

    pwg: {
        name: 'PWG',
        format: (pwg) => pwg ?? '-',
        visible: true,
        sortable: true,
        classes: 'w-5 f6',
    },

    requestedEventsCount: {
        name: 'Requested Events',
        format: (requestedEventsCount) => formatItemsCount(requestedEventsCount),
        visible: true,
        sortable: true,
        classes: 'w-10 f6',
    },

    generatedEventsCount: {
        name: 'Generated Events',
        format: (generatedEventsCount) => formatItemsCount(generatedEventsCount),
        visible: true,
        sortable: true,
        classes: 'w-10 f6',
    },

    outputSize: {
        name: 'Output Size (B)',
        visible: true,
        format: (outputSize) => formatSizeInBytes(outputSize),
        sortable: true,
        classes: 'w-10 f6',
    },

};
