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

import { h, info } from '@aliceo2/web-ui-frontend';
import { tooltip } from '../common/popover/tooltip.js';

/**
 * Convert a tag to a picker option
 *
 * @param {Tag} tag the tag to convert
 * @return {SelectionOption} the tag's option
 */
export const tagToOption = ({ text, description }) => ({
    value: text,
    label: description ? h('.flex-row.g2', [text, tooltip(info(), description)]) : text,
    rawLabel: text,
});
