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

import { tagBadge } from '../../../components/tag/tagBadge.js';
import { h } from '/js/src/index.js';

/**
 * Format a tag with its correct color
 *
 * @param {Tag[]} tags The run detector quality per detector
 * @param {object} [configuration] formatting configuration
 * @param {boolean} [configuration.flex] if true, tags list will be displayed in a flex component
 * @return {Component|string} Tag with its correct color or empty value
 */
export const formatTagsList = (tags, configuration) => {
    const { flex } = configuration || {};

    /**
     * Wrapp the tag badge component to remove the description
     *
     * @param {tag} tag the tag to display
     * @return {Component} the badge component
     */
    const tagToBadge = ({ text, archived, color }) => tagBadge({text, archived, color});

    if (!tags?.length) {
        return '-';
    }

    if (flex) {
        return h('.flex-row.flex-wrap.g2', tags.map(tagToBadge));
    } else {
        return tags.flatMap((tag) => [tagToBadge(tag), h('span.mr2')]);
    }
};
