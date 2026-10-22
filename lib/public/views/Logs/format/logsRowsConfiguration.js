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

/**
 * Rows configuration making a whole log row navigate to the log's details, to use on tables displaying logs
 *
 * The navigation is delegated to the link of the log's title, so it behaves like it. Clicks on other interactive content of the row (links,
 * buttons, inputs, popovers) and clicks ending a text selection are left untouched
 *
 * @type {RowsConfiguration}
 */
export const logsRowsConfiguration = {
    classes: 'clickable',
    callback: () => ({
        onclick: (event) => {
            if (event.target.closest('a, button, input, .popover') || window.getSelection().toString()) {
                return;
            }

            const titleLink = event.currentTarget.querySelector('a[id$="-title-link"]');
            if (!titleLink) {
                return;
            }

            if (event.ctrlKey || event.metaKey) {
                window.open(titleLink.href, '_blank');
            } else {
                titleLink.click();
            }
        },
    }),
};
