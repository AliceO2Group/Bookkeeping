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

/**
 * Display the properties of a given object (subject) as a formatted list of key => values pairs
 *
 * @param {Object} configuration object describing the list of fields that must be displayed and how they must be formatted
 * @param {Object} subject the current instance for which details must be displayed
 * @param {String} selector selector used to apply id to the container and to details items
 * @param {String} [emptyString=''] Default value displayed if a property has a null value, ignored if a formatting function is specified for
 *     the property
 * @return {vnode} the details component
 */
export const detailsList = (configuration, subject, selector, emptyString = '') => {
    if (!subject) {
        return null;
    }

    // Configuration may be grouped in sections, but list do not handle it so all sections are concatenated
    if (Array.isArray(configuration)) {
        let concatenated = {};
        for (const section of configuration) {
            if (!section._visible || section._visible(subject)) {
                concatenated = {
                    ...concatenated,
                    ...section,
                };
            }
        }
        configuration = concatenated;
    }
    return h(
        `#${selector}`,
        Object.entries(configuration).map(([key, { name, format }]) => {
            if (key.startsWith('_')) {
                // The key is configuration, not a real property
                return null;
            }

            return h(
                `.flex-row.justify-between.g3#${selector}-${key}`,
                h('strong', `${name}:`),
                (() => {
                    if (format) {
                        return format(subject[key], subject);
                    } else if (subject[key] !== null) {
                        return subject[key];
                    }
                    return emptyString;
                })(),
            );
        }),
    );
};
