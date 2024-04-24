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

import { absoluteFrontLink } from '../../../components/common/navigation/absoluteFrontLink.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { tooltip } from '../../../components/common/popover/tooltip.js';
import spinner from '../../../components/common/spinner.js';
import { configurationService } from '../../../services/configurationService.js';
import { MAX_RUN_DURATION } from '../../../services/run/constants.mjs';
import { h, iconWarning } from '/js/src/index.js';

/**
 * Sates whether the run is running
 *
 * @param {Run} run the run
 * @return {boolean|null} true if the run is running, false if it's not or cannot tell
 */
const isRunConsideredRunning = (run) => {
    const { runDuration, timeTrgEnd, timeO2End } = run;
    return (timeTrgEnd ?? timeO2End ?? null) === null && runDuration < MAX_RUN_DURATION;
};

/**
 * Format environment links
 * @param {Run} run the run
 * @return {Componenet} links
 */
export const displayEnvironmentLinks = ({ environmentId, ...run }) => h(
    '.flex-row.g2.items-baseline',
    [
        isRunConsideredRunning(run) && configurationService.configuration$.getCurrent().match({
            Success: ({ AliEcsGuiUrl }) => h('h4', absoluteFrontLink('ECS', `${AliEcsGuiUrl}?page=environment&id=${environmentId}`)),
            Loading: () => spinner({ size: 3, absolute: false }),
            Failure: () => tooltip(iconWarning(), 'Error when fetching configuration'),
            NotAsked: () => tooltip(iconWarning(), 'No configuration was asked for'),
        }),

        frontLink(environmentId, 'env-details', { environmentId }),
    ],
);
