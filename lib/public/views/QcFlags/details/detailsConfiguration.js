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

import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';
import { flagColoredBadge } from '../common/flagColoreBadge.js';

/**
 * Returns the configuration to display a given run
 *
 * @param {RunDetailsModel} qcFlagsDetailsModel the model storing the run details state
 * @return {Object} A collection of data with parameters for the Run detail page.
 */
export const qcFlagDetailsConfiguration = (qcFlagsDetailsModel) => ({
    timeStart: {
        name: 'From',
        visible: true,
        format: (timestamp) => formatTimestamp(timestamp),
    },
    timeEnd: {
        name: 'To',
        visible: true,
        format: (timestamp) => formatTimestamp(timestamp),
    },
    flagReason: {
        name: 'Flag Reason',
        visible: true,
        format: (flagReason) => [flagReason.method, flagColoredBadge(flagReason)],
    },
});
