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
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { frontLinks } from '../../../components/common/navigation/frontLinks.js';
import { tagFilter } from '../../../components/Filters/common/filters/tagFilter.js';
import { formatRunsList } from '../../Runs/format/formatRunsList.js';
import { profiles } from '../../../components/common/table/profiles.js';
import { formatLhcFillsList } from '../../LhcFills/format/formatLhcFillsList.js';
import { formatDataPassesList } from '../../DataPasses/format/formatDataPassesList.js';
import { formatSimulationPassesList } from '../../SimulationPasses/format/formatSimulationPassesList.js';
import { formatTagsList } from '../../Tags/format/formatTagsList.js';
import { timeRangeFilter } from '../../../components/Filters/common/filters/timeRangeFilter.js';
import { textInputFilter } from '../../../components/Filters/common/filters/textInputFilter.js';
import { overflowBalloon } from '../../../components/common/popover/overflowBalloon.js';
import { formatLogSnippet } from '../../../utilities/formatting/formatLogSnippet.js';

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
 * Display the title of a log as a link to the log's details
 *
 * @param {string} title the title of the log
 * @param {Log} log the log
 * @return {Component} the link
 */
const logTitleLink = (title, log) => frontLink(
    h(`#row${log.id}-title-value`, overflowBalloon(title)),
    'log-detail',
    { id: log.id },
    { id: `row${log.id}-title-link` },
);

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
        size: 'w-20',

        /**
         * Display the title, linking to the log, with a one-line preview of the log's content below it
         *
         * @param {string} title the title of the log
         * @param {Log} log the log
         * @return {Component} the title and its content preview
         */
        format: (title, log) => {
            const snippet = formatLogSnippet(log.text, title);
            return h('', [
                logTitleLink(title, log),
                snippet && h(`#row${log.id}-title-snippet.f7.gray-darker`, overflowBalloon(snippet)),
            ]);
        },

        /**
         * Title filter component
         *
         * @param {object} logOverviewModel the overview model
         * @param {FilteringModel} logOverviewModel.filteringModel filtering model
         * @return {Component} the filter component
         */
        filter: ({ filteringModel }) => textInputFilter(filteringModel, 'title', 'e.g. Report on runs: ...'),
        profiles: {
            embeded: {
                format: logTitleLink,
            },
            home: {
                sortable: false,
                size: 'w-60',
            },
        },
    },
    text: {
        name: 'Content',
        visible: false,
        size: 'w-10',

        /**
         * Content filter component
         *
         * @param {object} logOverviewModel the overview model
         * @param {FilteringModel} logOverviewModel.filteringModel the filtering model
         * @return {Component} the filter component
         */
        filter: ({ filteringModel }) => textInputFilter(filteringModel, 'content', 'e.g. Quality of run 52...'),
    },
    author: {
        name: 'Author',
        visible: false,

        /**
         * Author filter component
         *
         * The author is displayed in the created column, this column only provides its filter
         *
         * @param {object} logOverviewModel the overview model
         * @param {FilteringModel} logOverviewModel.filteringModel filtering model
         * @return {Component} the filter component
         */
        filter: ({ filteringModel }) => authorFilter(filteringModel.get('author')),
    },
    createdAt: {
        name: 'Created',
        visible: true,
        sortable: true,
        size: 'w-25',

        /**
         * Display the creation date with the author of the log below it
         *
         * @param {number} timestamp the creation timestamp of the log
         * @param {Log} log the log
         * @return {Component} the creation date and the author
         */
        format: (timestamp, log) => h('', [
            h(`#row${log.id}-created-date`, overflowBalloon(formatTimestamp(timestamp))),
            h(`#row${log.id}-created-author.f7.gray-darker`, overflowBalloon(`by ${log.author?.name ?? '-'}`)),
        ]),

        /**
         * Created filter component
         *
         * @param {object} logOverviewModel the overview model
         * @param {FilteringModel} logOverviewModel.filteringModel filtering model
         * @return {Component} the filter component
         */
        filter: ({ filteringModel }) => timeRangeFilter(filteringModel.get('created')),
        profiles: {
            embeded: true,
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
         *
         * @param {object} logOverviewModel the overview model
         * @param {FilteringModel} logOverviewModel.filteringModel filtering model
         * @return {Component} the filter component
         */
        filter: ({ filteringModel }) => tagFilter(filteringModel.get('tags')),
        balloon: true,
        profiles: [profiles.none, 'embeded'],
    },
    runs: {
        name: 'Runs',
        visible: true,
        sortable: true,
        size: 'w-15',
        format: formatRunsList,

        /**
         * Runs filter component
         *
         * @param {object} logOverviewModel the overview model
         * @param {FilteringModel} logOverviewModel.filteringModel filtering model
         * @return {Component} the filter component
         */
        filter: ({ filteringModel }) => textInputFilter(filteringModel, 'runNumbers', 'e.g. 553203, 553221, ...'),
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

        /**
         * Environment filter component
         *
         * @param {object} logOverviewModel the overview model
         * @param {FilteringModel} logOverviewModel.filteringModel filtering model
         * @return {Component} the filter component
         */
        filter: ({ filteringModel }) => textInputFilter(filteringModel, 'environmentIds', 'e.g. Dxi029djX, TDI59So3d...'),
        balloon: true,
        profiles: [profiles.none, 'embeded'],
    },
    lhcFills: {
        name: 'LHC Fills',
        visible: true,
        sortable: false,
        size: 'w-10',
        format: formatLhcFillsList,

        /**
         * LhcFills filter component
         *
         * @param {object} logOverviewModel the overview model
         * @param {FilteringModel} logOverviewModel.filteringModel filtering model
         * @return {Component} the filter component
         */
        filter: ({ filteringModel }) => textInputFilter(filteringModel, 'fillNumbers', 'e.g. 11392, 11383, 7625'),
        balloon: true,
        profiles: [profiles.none, 'embeded'],
    },
    passes: {
        name: 'Passes',
        visible: true,
        sortable: false,
        size: 'w-20',

        /**
         * Display the data passes and the simulation passes of the log, each in its own labelled line
         *
         * @param {*} _ unused, the passes are read from the log
         * @param {Log} log the log
         * @return {Component} the passes
         */
        format: (_, { id, dataPasses, simulationPasses }) => {
            const lines = [
                ['data', 'Data', dataPasses, formatDataPassesList],
                ['simulation', 'Sim', simulationPasses, formatSimulationPassesList],
            ]
                .filter(([, , passes]) => passes?.length > 0)
                .map(([lineId, label, passes, formatPasses]) => h(
                    `#row${id}-passes-${lineId}`,
                    overflowBalloon(h('', [h('span.f7.gray-darker', `${label} `), formatPasses(passes)])),
                ));

            return lines.length > 0 ? h('', lines) : '-';
        },
        profiles: [profiles.none, 'embeded'],
    },
    dataPasses: {
        name: 'Data passes',
        visible: false,

        /**
         * Data passes filter component
         *
         * The data passes are displayed in the passes column, this column only provides their filter
         *
         * @param {object} logOverviewModel the overview model
         * @param {FilteringModel} logOverviewModel.filteringModel filtering model
         * @return {Component} the filter component
         */
        filter: ({ filteringModel }) => textInputFilter(filteringModel, 'dataPasses', 'e.g. LHC22b_apass1, LHC22b_apass2'),
    },
    simulationPasses: {
        name: 'Simulation passes',
        visible: false,

        /**
         * Simulation passes filter component
         *
         * The simulation passes are displayed in the passes column, this column only provides their filter
         *
         * @param {object} logOverviewModel the overview model
         * @param {FilteringModel} logOverviewModel.filteringModel filtering model
         * @return {Component} the filter component
         */
        filter: ({ filteringModel }) => textInputFilter(filteringModel, 'simulationPasses', 'e.g. LHC23k6c, LHC23k6b'),
    },
    lhcPeriods: {
        name: 'LHC Periods',
        visible: false,
        filterTooltip: 'Logs are not linked to LHC periods directly: the period is inherited from the data passes linked to the log entry. '
            + 'A log entry matches if at least one of its data passes belongs to one of the given LHC periods.',

        /**
         * LHC periods filter component
         *
         * @param {object} logOverviewModel the overview model
         * @param {FilteringModel} logOverviewModel.filteringModel filtering model
         * @return {Component} the filter component
         */
        filter: ({ filteringModel }) => textInputFilter(filteringModel, 'lhcPeriods', 'e.g. LHC22b, LHC23f'),
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
};
