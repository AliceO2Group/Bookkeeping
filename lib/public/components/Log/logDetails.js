
import { h } from '/js/src/index.js';

import { formatTimestamp } from '../../utilities/formatting/formatTimestamp.js';
import { detailsFrontLinks } from '../common/navigation/frontLinks.js';


export const activeFields = () => ({
    id: {
        name: 'ID',
        visible: true,
    },
    author: {
        name: 'Source',
        visible: true,
        format: (author) => author.name,
    },
    createdAt: {
        name: 'Created',
        visible: true,
        format: (timestamp) => formatTimestamp(timestamp),
    },
    tags: {
        name: 'Tags',
        visible: true,
        format: (tags) => h('div.flex-row.flex-wrap', tags.map(({ text }) => h('div.badge.white.bg-gray-light.black.mr1', text))),
    },
    runs: {
        name: 'Runs',
        visible: true,
        format: (runs) => detailsFrontLinks(runs, ({ runNumber, id }) => ({
            content: runNumber,
            page: 'run-detail',
            parameters: { id },
        })),
    },
})

export const logDetails = (log, fields) => {
    return fields.map((key) =>
        h(`div#log-${log.id}-${key}.flex-row`, [
            h('div.mr2', `${activeFields()[key].name}:`),
            activeFields()[key].format(log[key]),
        ]))
}