import { h } from '/js/src/index.js';
import { iconX } from '/js/src/icons.js';

/**
 * Component to display whenever a page has warnings.
 *
 * @param {OverviewPageModel} overviewModel model that controlls an overview page
 * @returns {Component} the warning componen
 */
export const warningComponent = (overviewModel) => {
    const { warnings } = overviewModel;

    if (!warnings.size) {
        return null;
    }

    return h('details.alert.alert-warning', { open: true }, [
        h('summary', 'Warnings'),
        h('ul', warnings.entries().toArray().map(([key, message]) =>
            h('li.flex-row.items-center', [
                h(
                    '.btn.btn-pill.alert-warning.mh1',
                    {
                        onclick: () => {
                            warnings.delete(key);
                            overviewModel.notify();
                        },
                    },
                    iconX(),
                ),
                h('strong.mh1', `${key}:`),
                h('span', message),
            ]))),
    ]);
};
