
import { h } from '/js/src/index.js';
import { markdownDisplay } from '../common/markdown/markdown.js';

import { activeFields, logDetails } from "./logDetails.js";
import { logLinkButton } from "./logLinkButton.js";
import { logReplyButton } from "./logReplyButton.js";

const textBox = (log) => h(
    `div#log-id-${log.id}`,
    markdownDisplay(log.text, {
        classes: 'w-100',
        id: `log-content-${log.id}`,
    }),
);

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

export const logComponent = (log, highlight, showLogTitle, isCollapsed, onCollapse, onExpand, onCopyUrlSuccess) => {
    const logFields = activeFields();
    return h(
        `#log-${log.id}.w-100.m1.p3.shadow-level1${highlight ? '.b1.b-primary' : ''}`,
        h('div.mv1.flex-row.justify-between.g2', [
            h('div.flex-column.log-details-collapsed', [
                showLogTitle ? h(`h4#log-${log.id}-title`, log.title) : '',
                h('em', `${logFields.author.format(log.author)}, (${logFields.createdAt.format(log.createdAt)})`),
                !isCollapsed ? logDetails(log, ['tags', 'runs']) : logDetails(log, ['tags'])
            ]),
            h('div.flex-row.items-start', [
                logLinkButton(log, onCopyUrlSuccess), 
                logReplyButton(log),
                !isCollapsed ? collapseButton(log, onCollapse) : expandButton(log, onExpand)
            ]),
        ]),
        textBox(log),
    );
};
