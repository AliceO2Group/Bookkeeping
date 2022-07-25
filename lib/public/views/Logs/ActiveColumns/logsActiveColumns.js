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
import { iconCommentSquare, iconPaperclip, iconCheck } from '/js/src/icons.js';

import titleFilter from '../../../components/Filters/LogsFilter/title.js';
import authorFilter from '../../../components/Filters/LogsFilter/author.js';
import createdFilter from '../../../components/Filters/LogsFilter/created.js';
import runsFilter from '../../../components/Filters/LogsFilter/runs.js';
import { remoteDataTagFilter } from '../../../components/Filters/common/remoteDataTagFilter.js';
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';

/**
 * A method to display a small and simple number/icon collection as a column
 * @param {Number} count The number to display
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
    },
    title: {
        name: 'Title',
        visible: true,
        sortable: true,
        size: 'w-30',
        format: (title, log) => title ? title : log.parentLogId ? `Re: log id ${log.parentLogId}` : 'Re: - ',
        filter: titleFilter,
        balloon: true,
    },
    author: {
        name: 'Author',
        visible: true,
        sortable: true,
        size: 'w-15',
        format: (author) => author.name,
        filter: authorFilter,
    },
    createdAt: {
        name: 'Created',
        visible: true,
        sortable: true,
        size: 'w-10',
        format: (timestamp) => formatTimestamp(timestamp, false),
        filter: createdFilter,
    },
    tags: {
        name: 'Tags',
        visible: true,
        sortable: true,
        size: 'w-15',
        format: (tags) => tags && tags.length > 0 ? tags.map(({ text }) => text).join(', ') : '-',
        filter: (model) => remoteDataTagFilter(model.tags.getTags(), model.logs.listingTagsFilterModel),
        balloon: true,
    },
    runs: {
        name: 'Runs',
        visible: true,
        sortable: true,
        size: 'w-15',
        format: (runs) => runs && runs.length > 0 ? runs.map(({ runNumber }) => runNumber).join(', ') : '-',
        filter: runsFilter,
        balloon: true,
    },
    parentLogId: {
        name: '',
        visible: false,
        size: 'w-5',
        format: (parentLogId, log) => parentLogId === log.id ? '' : iconCheck(),
    },
    replies: {
        name: 'Replies',
        visible: true,
        size: 'w-5',
        format: (replies) => iconWithCountContainer(replies, iconCommentSquare()),
    },
    attachments: {
        name: 'Attachments',
        visible: true,
        size: 'w-5',
        format: (attachments) => iconWithCountContainer(attachments.length, iconPaperclip()),
    },
    actions: {
        name: '',
        visible: true,
        sortable: false,
        size: 'w-5',
        format: (_, log) => h('.w-100.flex-row', {
            style: 'justify-content: end',
        }, h(`a#btn${log.id}.btn.btn-primary.btn-sm.btn-redirect`, {
            href: `?page=log-detail&id=${log.id}`,
        }, 'More')),
    },
};

/**
 * List of active columns for the logs' table on the home overview page
 */
export const homeOverviewLogsActiveColumns = {
    id: {
        name: 'Entry ID',
        visible: false,
        primary: true,
    },
    title: {
        name: 'Title',
        visible: true,
        sortable: false,
        size: 'w-60',
        expand: true,
        format: (title, log) => title ? title : log.parentLogId ? `Re: log id ${log.parentLogId}` : 'Re: - ',
    },
    createdAt: {
        name: 'Created',
        visible: true,
        sortable: false,
        size: 'w-30',
        format: (timestamp) => formatTimestamp(timestamp),
    },
    actions: {
        name: '',
        visible: true,
        sortable: false,
        size: 'w-10',
        format: (_, log) =>
            h('.flex-row', {
                style: 'justify-content: end',
            }, h(`a#btn${log.id}.btn.btn-primary.btn-sm.btn-redirect`, {
                href: `?page=log-detail&id=${log.id}`,
            }, 'More')),
    },
};
