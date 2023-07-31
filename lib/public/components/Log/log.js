
import { h } from '/js/src/index.js';
import { markdownDisplay } from '../common/markdown/markdown.js';

import { formatTimestamp } from '../../utilities/formatting/formatTimestamp.js';
import { detailsFrontLinks } from '../common/navigation/frontLinks.js';

import { logLinkButton } from "./logLinkButton.js";
import { logReplyButton } from "./logReplyButton.js";
import { Log } from '@aliceo2/web-ui';

/**
 * Provides formatting for each log field to display that field on the webpage
 * @param {string} authenticationToken token to authenticate api requests. Used for attachments
 * @return {Object}
 */
const logFields = (authenticationToken) => ({
    author: {
        name: 'Source',
        format: (author) => author.name,
    },
    createdAt: {
        name: 'Created',
        format: (timestamp) => formatTimestamp(timestamp),
    },
    tags: {
        name: 'Tags',
        format: (tags) => h('div.flex-row.flex-wrap.g1', tags.map(({ text }) => h('div.badge.white.bg-gray-light.black', text))),
    },
    runs: {
        name: 'Runs',
        format: (runs) => detailsFrontLinks(runs, ({ runNumber, id }) => ({
            content: runNumber,
            page: 'run-detail',
            parameters: { id },
        })),
    },
    attachments: {
        name: 'Attachments',
        visible: true,
        format: (attachments) => detailsFrontLinks(
            attachments,
            ({ fileName, originalName, id }) => ({
                content: originalName,
                href: `/api/attachments/${id}?token=${authenticationToken}`,
                attributes: { download: fileName, class: 'break-all' },
            }),
            { bypassRouter: true },
        ),
    }
})

/**
 * For some given fields, returns the hyperscript to display those fields in the form
 * <name>: <formatted data> 
 * @param {Log} log the log
 * @param {string[]} fields the names of the fields to display
 * @param {*} fieldFormats an object containing a format function for each field
 * @return {Component} the log field displayed
 */
const logDetails = (log, fields, fieldFormats) => {
    return fields.map((key) =>
        h(`div#log-${log.id}-${key}.flex-row`, [
            h('div.mr2', `${fieldFormats[key].name}:`),
            fieldFormats[key].format(log[key]),
        ]))
}

/**
 * Returns a log's content display
 *
 * @param {Log} log the log to display
 * @return {Component} the log's content display
 */
const textBox = (log, isCollapsed) => h(`div#log-id-${log.id}`,
    isCollapsed
    ? h(`.text-ellipsis.w-100#log-content-${log.id}`, log.text)
    : markdownDisplay(log.text, {
        classes: 'w-100',
        id: `log-content-${log.id}`,
    })
);

/**
 * Returns a collapse button.
 *
 * @param {Log} log the log to collapse
 * @param {function} onClick function called when button is activated
 * @return {Component} the collapse button component
 */
const collapseButton = (log, onClick) => h('a.btn.btn-primary', {
    id: `collapse-${log.id}`,
    onclick: onClick,
}, 'Collapse');

/**
 * Returns an expand button.
 *
 * @param {Log} log the log to expand
 * @param {function} onClick function called when button is activated
 * @return {Component} the expand button component
 */
const expandButton = (log, onClick) => h('a.btn.btn-primary', {
    id: `show-collapse-${log.id}`,
    onclick: onClick,
}, 'Show');

/**
 * the fields to be displayed when the log is expanded
 */
const expandedLogFields = ['runs', 'attachments'];

/**
 * 
 * @param {Log} log all data related to the log
 * @param {boolean} highlight indicator if this log should be highlighted
 * @param {boolean} showLogTitle indicator if the title of this log should be visible
 * @param {boolean} isCollapsed indicator if the title of this log is collapsed
 * @param {function} onCollapse function called when the log should be collapsed
 * @param {function} onExpand function called when the log should be expanded
 * @param {function} onCopyUrlSuccess function called when the url of the log has been copied to the clipboard
 * @param {string} authenticationToken token to authenticate the session with the api
 * @return {Component} the log's display component
 */
export const logComponent = (log, highlight, showLogTitle, isCollapsed, onCollapse, onExpand, onCopyUrlSuccess, authenticationToken) => {
    const fieldFormatting = logFields(authenticationToken);

    return h(`#log-${log.id}.br2.m1.p3.shadow-level1.flex-column.g3${highlight ? '.b1.b-primary' : ''}`,
        h('div.flex-row.justify-between.', [
            h('div.flex-column.log-details-collapsed.g1', [
                showLogTitle ? h(`h4#log-${log.id}-title`, log.title) : '',
                h('.flex-row.flex-wrap.g1', [
                    h('em', `${fieldFormatting.author.format(log.author)} (${fieldFormatting.createdAt.format(log.createdAt)})`),
                ]),
                fieldFormatting.tags.format(log.tags),
                !isCollapsed 
                    ? logDetails(log, expandedLogFields, fieldFormatting) 
                    : ''
            ]),
            h('div.flex-row.flex-shrink-0.flex-wrap.items-start.g1', [
                logLinkButton(log, onCopyUrlSuccess), 
                logReplyButton(log),
                !isCollapsed 
                    ? collapseButton(log, onCollapse) 
                    : expandButton(log, onExpand)
            ]),
        ]),
        h('.bt1.b-gray-light'),
        textBox(log, isCollapsed)
    );
};
