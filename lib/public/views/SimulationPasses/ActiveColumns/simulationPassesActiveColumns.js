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
import { textFilter } from '../../../components/Filters/common/filters/textFilter.js';
import { externalLinks } from '../../../components/common/externalLinks.js';
import { absoluteFrontLink } from '../../../components/common/navigation/absoluteFrontLink.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';

/**
 * List of active columns for a generic simulation passes table
 */
export const simulationPassesActiveColumns = {
    name: {
        name: 'Name',
        visible: true,
        format: (name, { id }) => h('.flex-row.flex-wrap.g3', [
            h('.w-10', name),
            h('.mh4'),
            frontLink('Anchorage', 'data-passes-per-simulation-pass-overview', { simulationPassId: id }),
        ]),
        sortable: true,
        filter: ({ namesFilterModel }) => textFilter(
            namesFilterModel,
            { class: 'w-75 mt1', placeholder: 'e.g. LHC22a_apass1, ...' },
        ),
        size: 'w-15 f6',
    },

    description: {
        name: 'Description',
        visible: true,
        sortable: false,
    },

    jiraId: {
        name: 'Jira',
        visible: true,
        format: (jiraId) => absoluteFrontLink(jiraId, `${externalLinks.JIRA}/browse/${jiraId}`, { target: '_blank' }) ?? '-',
        sortable: true,
        size: 'w-5 f6',
    },

    pwg: {
        name: 'PWG',
        format: (pwg) => pwg ?? '-',
        visible: true,
        sortable: true,
        size: 'w-5 f6',
    },

    requestedEventsCount: {
        name: 'Requested Events',
        format: (requestedEventsCount) => requestedEventsCount ? requestedEventsCount.toLocaleString('en-US') : '-',
        visible: true,
        sortable: true,
        size: 'w-10 f6',
    },

    generatedEventsCount: {
        name: 'Generated Events',
        format: (generatedEventsCount) => generatedEventsCount ? generatedEventsCount.toLocaleString('en-US') : '-',
        visible: true,
        sortable: true,
        size: 'w-10 f6',
    },

    outputSize: {
        name: 'Output Size [B]',
        visible: true,
        format: (outputSize) => outputSize ? outputSize.toLocaleString('en-US') : '-',
        sortable: true,
        size: 'w-10 f6',
    },

};
