import { h } from '/js/src/index.js';

/**
 * Convert a tag to a picker option with emphasis on the tag archived status
 *
 * @param {Tag} tag the tag to convert
 * @return {SelectionOption} the tag's option
 */
export const tagToOptionWithArchiveBadge = ({ text, archived }) => ({
    value: text,
    label: h('.flex-row.g2.items-center', [text, archived ? h('small.badge.bg-gray-darker.white', 'Archived') : null]),
});
