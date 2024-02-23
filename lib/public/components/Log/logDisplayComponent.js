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

import { formatTimestamp } from '../../utilities/formatting/formatTimestamp.js';
import { detailsFrontLinks } from '../common/navigation/frontLinks.js';

import { logLinkButton } from './logLinkButton.js';
import { attachmentPreviewComponent } from '../../views/Logs/FilePreview/attachmentPreviewComponent.js';
import { tagBadge } from '../tag/tagBadge.js';
import { markdownDisplay } from '../common/markdown/markdown.js';

/**
 * Map between log properties and the way to display it
 *
 * @return {Object} an object determining how each log field wil lbe displayed on the page
 */
const logFields = () => ({
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
        format: (tags) => h('div.flex-row.flex-wrap.g1', tags.map(tagBadge)),
    },
    runs: {
        name: 'Runs',
        format: (runs) => detailsFrontLinks(runs, ({ runNumber }) => ({
            content: runNumber,
            page: 'run-detail',
            parameters: { runNumber },
        })),
    },
    environments: {
        name: 'Environments',
        format: (environments) => detailsFrontLinks(environments, ({ id }) => ({
            content: id,
            page: 'env-details',
            parameters: { environmentId: id },
        })),
    },
    lhcFills: {
        name: 'LHC Fills',
        format: (lhcFills) => detailsFrontLinks(lhcFills, ({ fillNumber }) => ({
            content: fillNumber,
            page: 'lhc-fill-details',
            parameters: { fillNumber },
        })),
    },
    attachments: {
        name: 'Attachments',
        visible: true,
        format: (attachments) => h('span.flex-row.flex-wrap.gc1', attachments.flatMap((attachment) => [
            attachmentPreviewComponent(attachment),
            h('span.mr2', ','),
        ]).slice(0, -1)),
    },
});

/**
 * Format a given log's metadata
 *
 * @param {Log} log the log
 * @param {string[]} fields the names of the fields to display
 * @param {Object} fieldFormats an object containing a format function for each field
 * @return {Component} the log field displayed
 */
const displayLogMetadata = (log, fields, fieldFormats) => fields.map((key) => h(`div#log-${log.id}-${key}.flex-row`, [
    h('div.mr2', `${fieldFormats[key].name}:`),
    fieldFormats[key].format(log[key]),
]));

/**
 * Returns a component displaying the text of a log
 *
 * @param {Log} log the log to display
 * @param {object} [options] display options
 * @param {boolean} [options.isCollapsed] true if the log is collapsed
 * @param {Partial<MarkdownBoxSize>} [options.boxSize] the text's markdown box size
 * @return {Component} the log's text display
 */
const displayLogText = (log, options) => {
    const { isCollapsed, boxSize } = options || {};

    return h(
        `div#log-id-${log.id}`,
        isCollapsed
            ? h(`.text-ellipsis.w-100#log-text-${log.id}`, log.text)
            : markdownDisplay(
                log.text,
                {
                    classes: 'w-100',
                    id: `log-text-${log.id}`,
                },
                boxSize,
            ),
    );
};

const expandedLogFields = ['runs', 'environments', 'lhcFills', 'attachments'];

/**
 * Returns a card for the given log
 *
 * @param {Log} log all data related to the log
 * @param {boolean} isCollapsed indicator if the title of this log is collapsed
 * @param {function} setCollapsed function called when the log should be collapsed or expanded
 * @param {Object} [options] other options
 * @param {boolean} [options.highlight] indicator if this log should be highlighted
 * @param {boolean} [options.hideTitle] indicator if the title of this log should be visible
 * @param {Component} [options.customActionButtons] optional custom buttons to display between copy link and collapse
 * @param {Partial<MarkdownBoxSize>} [options.textBoxSize] size of the log's content markdown display
 * @return {Component} the log's display component
 */
export const logDisplayComponent = (
    log,
    isCollapsed,
    setCollapsed,
    options,
) => {
    const { title = '', id = '' } = log;
    const { highlight, hideTitle, customActionButtons, textBoxSize } = options || {};

    const fieldFormatting = logFields();
    const logTitle = !hideTitle && h(`h4#log-${id}-title`, title);
    const displayedLogFields = isCollapsed ? [] : expandedLogFields;
    const logViewButton = h('button.btn.btn-primary', { onclick: () => setCollapsed(!isCollapsed) }, isCollapsed ? 'Show' : 'Collapse');

    return h(
        `#log-${id}.br2.m1.p3.shadow-level1.flex-column.g1${highlight ? '.b1.b-primary' : ''}`,
        h('div.flex-row.justify-between.', [
            h(`div.flex-column.g1.log-details-${isCollapsed ? 'collapsed' : 'expanded'}`, [
                logTitle,
                h(
                    '.flex-row.flex-wrap.g1',
                    h('em', `${fieldFormatting.author.format(log.author)} (${fieldFormatting.createdAt.format(log.createdAt)})`),
                ),
                fieldFormatting.tags.format(log.tags),
            ]),
            h('div.log-display-action-buttons.flex-row.flex-shrink-0.flex-wrap.items-start.g1', [
                logLinkButton(log),
                customActionButtons,
                logViewButton,
            ]),
        ]),
        displayLogMetadata(log, displayedLogFields, fieldFormatting),
        h('.bt1.b-gray-light.pv2'),
        displayLogText(log, { isCollapsed, boxSize: textBoxSize }),
    );
};
