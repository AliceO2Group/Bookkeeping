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

const TAGS_DISPLAY_LIMIT = 1;

/**
 * Display a small icon followed by a count, or nothing if the count is null
 *
 * @param {string} id the id of the element
 * @param {number} count the number to display
 * @param {Object} icon the icon to display
 * @param {string} description the description of what is counted, displayed as tooltip
 * @return {Component|null} the icon and its count
 */
const iconWithCount = (id, count, icon, description) => count > 0
    ? h(`#${id}.flex-row.items-center.gray-darker`, { title: `${count} ${description}` }, [h('.f7', icon), h('.f6.ml1', count)])
    : null;

/**
 * Display the title of a log as a link to the log's details, followed by the number of replies and attachments of the log
 *
 * @param {string} title the title of the log
 * @param {Log} log the log
 * @return {Component} the title line
 */
const logTitleLine = (title, { id, replies, attachments }) => h('.flex-row.items-center.g2', [
    frontLink(
        h(`#row${id}-title-value`, overflowBalloon(title)),
        'log-detail',
        { id },
        { id: `row${id}-title-link`, class: 'flex-grow' },
    ),
    h('.flex-row.g2.flex-shrink-0', [
        iconWithCount(`row${id}-replies-count`, replies, iconCommentSquare(), 'replies'),
        iconWithCount(`row${id}-attachments-count`, attachments?.length, iconPaperclip(), 'attachments'),
    ]),
]);

/**
 * Display the given environments as links to their details
 *
 * @param {{id: string}[]} environments the environments to display
 * @return {Component} the list of links
 */
const formatEnvironmentsList = (environments) => frontLinks(
    environments,
    ({ id }) => ({
        content: id,
        page: 'env-details',
        parameters: { environmentId: id },
    }),
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
        size: 'w-35',

        /**
         * Display the title, linking to the log, with the number of replies and attachments of the log and a one-line preview of the log's
         * content below it
         *
         * @param {string} title the title of the log
         * @param {Log} log the log
         * @return {Component} the title and its content preview
         */
        format: (title, log) => {
            const snippet = formatLogSnippet(log.text, title);
            return h('', [
                logTitleLine(title, log),
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
                format: logTitleLine,
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
        size: 'w-20',

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
    linkedTo: {
        name: 'Linked to',
        visible: true,
        sortable: false,
        size: 'w-20',

        /**
         * Display the runs, the environments and the LHC fills of the log, each in its own labelled line
         *
         * @param {*} _ unused, the linked entities are read from the log
         * @param {Log} log the log
         * @return {Component} the runs, environments and LHC fills
         */
        format: (_, { id, runs, environments, lhcFills }) => {
            const lines = [
                ['runs', 'Runs', runs, formatRunsList],
                ['environments', 'Env', environments, formatEnvironmentsList],
                ['lhcFills', 'Fills', lhcFills, formatLhcFillsList],
            ]
                .filter(([, , items]) => items?.length > 0)
                .map(([lineId, label, items, formatItems]) => h(
                    `#row${id}-${lineId}`,
                    overflowBalloon(h('', [h('span.f7.gray-darker', `${label} `), formatItems(items)])),
                ));

            return lines.length > 0 ? h('', lines) : '-';
        },
        profiles: [profiles.none, 'embeded'],
    },
    runs: {
        name: 'Runs',
        visible: false,

        /**
         * Runs filter component
         *
         * The runs are displayed in the linked to column, this column only provides their filter
         *
         * @param {object} logOverviewModel the overview model
         * @param {FilteringModel} logOverviewModel.filteringModel filtering model
         * @return {Component} the filter component
         */
        filter: ({ filteringModel }) => textInputFilter(filteringModel, 'runNumbers', 'e.g. 553203, 553221, ...'),
    },
    environments: {
        name: 'Environments',
        visible: false,

        /**
         * Environment filter component
         *
         * The environments are displayed in the linked to column, this column only provides their filter
         *
         * @param {object} logOverviewModel the overview model
         * @param {FilteringModel} logOverviewModel.filteringModel filtering model
         * @return {Component} the filter component
         */
        filter: ({ filteringModel }) => textInputFilter(filteringModel, 'environmentIds', 'e.g. Dxi029djX, TDI59So3d...'),
    },
    lhcFills: {
        name: 'LHC Fills',
        visible: false,

        /**
         * LhcFills filter component
         *
         * The LHC fills are displayed in the linked to column, this column only provides their filter
         *
         * @param {object} logOverviewModel the overview model
         * @param {FilteringModel} logOverviewModel.filteringModel filtering model
         * @return {Component} the filter component
         */
        filter: ({ filteringModel }) => textInputFilter(filteringModel, 'fillNumbers', 'e.g. 11392, 11383, 7625'),
    },
    passes: {
        name: 'Passes',
        visible: true,
        sortable: false,
        size: 'w-10',

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
    tags: {
        name: 'Tags',
        visible: true,
        sortable: true,
        size: 'w-15',
        format: (tags, { id }) => h(`#row${id}-tags`, formatTagsList(tags, { flex: true, limit: TAGS_DISPLAY_LIMIT })),

        /**
         * Tag filter component
         *
         * @param {object} logOverviewModel the overview model
         * @param {FilteringModel} logOverviewModel.filteringModel filtering model
         * @return {Component} the filter component
         */
        filter: ({ filteringModel }) => tagFilter(filteringModel.get('tags')),
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
};
