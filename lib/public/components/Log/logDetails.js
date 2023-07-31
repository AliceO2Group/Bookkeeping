
import { h } from '/js/src/index.js';

import { formatTimestamp } from '../../utilities/formatting/formatTimestamp.js';
import { detailsFrontLinks } from '../common/navigation/frontLinks.js';

export const logDetails = (log, fields) => {
    return fields.map((key) =>
        h(`div#log-${log.id}-${key}.flex-row`, [
            h('div.mr2', `${activeFields()[key].name}:`),
            activeFields()[key].format(log[key]),
        ]))
}