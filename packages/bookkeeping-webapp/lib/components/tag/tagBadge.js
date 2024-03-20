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

import { badge } from '../common/badge.js';
import { h, info } from '/js/src/index.js';
import { tooltip } from '../common/popover/tooltip.js';

/**
 * Display a colored tag badge
 *
 * @param {object} tag the tag to display
 * @param {object} [configuration] the configuration of the tag badge
 * @param {boolean} [configuration.normalSize] if true, the badge will be displayed in normal size
 * @return {Component} the tag badge
 */
export const tagBadge = ({ text, archived, color, description }, configuration) => {
    const { normalSize } = configuration || {};

    return badge(
        h(
            'span.flex-row.g1',
            description ? [text, tooltip(info(), description)] : text,
        ),
        { color, small: !normalSize, outline: archived },
    );
};
