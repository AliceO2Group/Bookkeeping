/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

import { formatTimestamp as defaultFormatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';

/**
 * Format the current timestamp range display
 *
 * @param {Partial<Period>} period the current period
 * @param {object} [configuration] the formatting configuration
 * @param {function} [configuration.formatTimestamp] the function to format the period's timestamps
 * @param {function} [configuration.formatText] the function to format the time-range texts, such as `From`, `to`...
 * @param {function} [configuration.formatParts] the function to format all the formatted timeRange parts, which are the timestamps and the
 *                                               keywords, for example [`From`, `2023-01-01`]
 * @return {Component} the resulting component
 */
export const formatTimeRange = ({ from, to }, configuration) => {
    const {
        formatTimestamp = (timestamp) => defaultFormatTimestamp(timestamp, true),
        formatText = (content) => content,
        formatParts = (parts) => parts.join(' '),
    } = configuration || {};

    let parts = [];

    if (from === undefined && to === undefined) {
        parts = '-';
    } else if (from === undefined) {
        parts = [formatText('Before'), formatTimestamp(to)];
    } else if (to === undefined) {
        parts = [formatText('After'), formatTimestamp(from)];
    } else {
        parts = [formatText('From'), formatTimestamp(from), formatText('to'), formatTimestamp(to)];
    }

    return formatParts(parts);
};
