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

import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';
import { qcFlagTypeColoredBadge } from '../common/qcFlagTypeColoredBadge.js';

/**
 * Returns the configuration to display a given run
 *
 * @param {RunDetailsModel} qcFlagsDetailsModel the model storing the run details state
 * @return {Object} A collection of data with parameters for the Run detail page.
 */
export const qcFlagDetailsConfiguration = (qcFlagsDetailsModel) => ({
    id: {
        name: 'Id',
        visible: true,
    },
    run: {
        name: 'Run',
        visible: true,
        format: (_, { runNumber }) => frontLink(runNumber, 'run-detail', { runNumber }),
    },
    dplDetector: {
        name: 'Detector',
        visible: true,
        format: () => qcFlagsDetailsModel.dplDetector.match({ Success: ({ name }) => name, Other: () => null }),
    },
    from: {
        name: 'From',
        visible: true,
        format: (timestamp) => formatTimestamp(timestamp),
    },
    to: {
        name: 'To',
        visible: true,
        format: (timestamp) => formatTimestamp(timestamp),
    },
    flagType: {
        name: 'Type',
        visible: true,
        format: (flagType) => qcFlagTypeColoredBadge(flagType),
    },
});
