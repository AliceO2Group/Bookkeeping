import { h, info } from '@aliceo2/web-ui-frontend';
import { tooltip } from '../common/popover/tooltip.js';

/**
 * Convert a tag to a picker option with emphasis on the tag archived status
 *
 * @param {Tag} tag the tag to convert
 * @return {SelectionOption} the tag's option
 */
export const tagToOptionWithArchiveBadge = ({ text, archived, description }) => ({
    value: text,
    label: h(
        '.flex-row.g2.items-center',
        [
            text,
            description ? tooltip(info(), description) : null,
            archived ? h('small.badge.bg-gray-darker.white', 'Archived') : null,
        ],
    ),
    rawLabel: text,
});
