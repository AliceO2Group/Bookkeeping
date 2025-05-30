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
import { iconCommentSquare, iconPaperclip } from '/js/src/icons.js';

import { authorFilter } from '../../../components/Filters/LogsFilter/author/authorFilter.js';
import createdFilter from '../../../components/Filters/LogsFilter/created.js';
import runsFilter from '../../../components/Filters/LogsFilter/runs.js';
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { frontLinks } from '../../../components/common/navigation/frontLinks.js';
import { tagFilter } from '../../../components/Filters/common/filters/tagFilter.js';
import { formatRunsList } from '../../Runs/format/formatRunsList.js';
import { profiles } from '../../../components/common/table/profiles.js';
import { textFilter } from '../../../components/Filters/common/filters/textFilter.js';
import { environmentFilter } from '../../../components/Filters/LogsFilter/environments.js';
import { formatLhcFillsList } from '../../LhcFills/format/formatLhcFillsList.js';
import { lhcFillsFilter } from '../../../components/Filters/LogsFilter/lhcFill.js';
import { formatTagsList } from '../../Tags/format/formatTagsList.js';

/**
 * A method to display a small and simple number/icon collection as a column
 * @param {number} count The number to display
 * @param {Object} icon The icon to display
 * @return {vnode} A wrapped vnode containing the specified icon and count
 */
const iconWithCountContainer = (count, icon) => count > 0 ? h('.flex-row.items-center.gray-darker', [
    h('.f7', icon),
    h('.f6.ml1', count),
]) : '-';

/**
 * List of active columns for a logs table
 */
export const logsActiveColumns = {
    id: {
        name: 'Entry ID',
        visible: false,
        primary: true,
        profiles: [profiles.none, 'embeded'],
    },
    view: {
        name: '',
        visible: true,
        size: 'w-15',
        sortable: false,
        format: (_, log) => frontLink(
            'View',
            'log-detail',
            { id: log.id },
            {
                id: `btn${log.id}`,
                class: 'btn btn-primary btn-redirect ph2',
            },
        ),
        profiles: ['home'],
    },
    title: {
        name: 'Title',
        visible: true,
        sortable: true,
        size: 'w-30',
        filter: ({ titleFilter }) => textFilter(
            titleFilter,
            {
                id: 'titleFilterText',
                class: 'w-75 mt1',
            },
        ),
        balloon: true,
        profiles: {
            embeded: true,
            home: {
                balloon: true,
                sortable: false,
                size: 'w-60',
            },
        },
    },
    text: {
        name: 'Content',
        visible: false,
        size: 'w-10',
        filter: ({ contentFilter }) => textFilter(
            contentFilter,
            {
                id: 'contentFilterText',
                class: 'w-75 mt1',
            },
        ),
    },
    author: {
        name: 'Author',
        visible: true,
        sortable: true,
        size: 'w-15',
        format: (author) => author.name,
        filter: authorFilter,
        profiles: [profiles.none, 'embeded'],
    },
    createdAt: {
        name: 'Created',
        visible: true,
        sortable: true,
        size: 'w-10',
        format: (timestamp) => formatTimestamp(timestamp, false),
        filter: createdFilter,
        profiles: {
            embeded: {
                format: (timestamp) => formatTimestamp(timestamp),
            },
            home: {
                sortable: false,
                balloon: true,
                size: 'w-30',
                format: (timestamp) => formatTimestamp(timestamp),
            },
        },
    },
    tags: {
        name: 'Tags',
        visible: true,
        sortable: true,
        size: 'w-15',
        format: (tags) => formatTagsList(tags),

        /**
         * Tag filter component
         * @param {LogsOverviewModel} logsModel the log model
         * @return {Component} the filter component
         */
        filter: (logsModel) => tagFilter(logsModel.listingTagsFilterModel),
        balloon: true,
        profiles: [profiles.none, 'embeded'],
    },
    runs: {
        name: 'Runs',
        visible: true,
        sortable: true,
        size: 'w-15',
        format: formatRunsList,
        filter: runsFilter,
        balloon: true,
        profiles: [profiles.none, 'embeded'],
    },
    environments: {
        name: 'Environments',
        visible: true,
        sortable: true,
        size: 'w-15',
        format: (logs) => frontLinks(
            logs,
            ({ id }) => ({
                content: id,
                page: 'env-details',
                parameters: { environmentId: id },
            }),
        ),
        filter: environmentFilter,
        balloon: true,
        profiles: [profiles.none, 'embeded'],
    },
    lhcFills: {
        name: 'LHC Fills',
        visible: true,
        sortable: false,
        size: 'w-10',
        format: formatLhcFillsList,
        filter: lhcFillsFilter,
        balloon: true,
        profiles: [profiles.none, 'embeded'],
    },
    parentLogId: {
        name: '',
        visible: false,
        size: 'w-5',
    },
    replies: {
        name: 'Replies',
        visible: true,
        size: 'w-5',
        format: (replies) => iconWithCountContainer(replies, iconCommentSquare()),
        profiles: [profiles.none, 'embeded'],
    },
    attachments: {
        name: 'Attachments',
        visible: true,
        size: 'w-5',
        format: (attachments) => iconWithCountContainer(attachments.length, iconPaperclip()),
        profiles: [profiles.none, 'embeded'],
    },
    actions: {
        name: '',
        visible: true,
        sortable: false,
        size: 'w-5',
        format: (_, log) => h(
            '.w-100.flex-row',
            {
                style: 'justify-content: end',
            },
            frontLink(
                'More',
                'log-detail',
                { id: log.id },
                {
                    id: `btn${log.id}`,
                    class: 'btn btn-primary btn-sm btn-redirect',
                },
            ),
        ),
        profiles: {
            embeded: true,
        },
    },
};
