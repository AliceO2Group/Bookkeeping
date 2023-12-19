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

import { switchCase } from '@aliceo2/web-ui-frontend';

/**
 * Formatt alice current value
 * @param {'NEGATIVE'|'POSITIVE'|null} polarity polarity of a current
 * @param {number} current absolute value of a current
 * @return {string} formatted value
 */
export const formatAliceCurrent = (polarity, current) => (
    switchCase(polarity, { NEGATIVE: -1, POSITIVE: 1, null: 1 }) * current
).toLocaleString('en-US');
