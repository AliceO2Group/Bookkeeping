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
 * Display the properties of a given object (subject) in a grid of key => values
 *
 * @param {Object} configuration object describing the list of fields that must be displayed and how they must be formatted
 * @param {Object} subject the current instance for which details must be displayed
 * @param {String} selector selector used to apply id to the container and to details items
 * @param {String} [emptyString=''] Default value displayed if a property has a null value, ignored if a formatting function is specified for
 *     the property
 *
 * @return {vnode} the details component
 */
export const detailsGrid = (configuration, subject, selector, emptyString = '') => {
    if (!Array.isArray(configuration)) {
        configuration = [configuration];
    }

    return h(`#${selector}.details-container`, configuration.map((section) => h(
        '.detail-section',
        Object.entries(section).map(([key, { name, format }]) => h(
            `.flex-row.g3#${selector}-${key}`,
            h('strong', `${name}:`),
            (() => {
                if (format) {
                    return format(subject[key], subject);
                } else if (subject[key] !== null) {
                    return subject[key];
                }
                return emptyString;
            })(),
        )),
    )));
};
