import { h } from '/js/src/index.js';

/**
 * Component to display whenever a page has warnings.
 *
 * @param {Array<(string, string)>} warnings an array of warnings and messages
 * @returns {Component} the warning componen
 */
export const warningComponent = (warnings) => {
    if (!warnings.length) {
        return null;
    }

    return h('details.alert alert-warning', [
        h('summary', 'Warnings'),
        h('ul', warnings.map(([key, message]) => h('li', `${key}: ${message}`))),
    ]);
};
