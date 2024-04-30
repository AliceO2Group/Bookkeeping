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

import { tooltip } from '../popover/tooltip.js';
import spinner from '../spinner.js';
import { configurationService } from '../../../services/configurationService.js';
import { h, iconWarning } from '/js/src/index.js';

/**
 * Format environment links
 * @param {Run} run the run
 * @return {Componenet} links
 */
export const getAliEcsEnvironmentLink = ({ environmentId }) =>
    configurationService.configuration$.getCurrent().match({
        Success: ({ AliEcsGuiUrl }) => h('a', { href: `${AliEcsGuiUrl}?page=environment&id=${environmentId}`, target: '_blank' }, 'ECS'),
        Loading: () => spinner({ size: 3, absolute: false }),
        Failure: () => tooltip(iconWarning(), 'Error when fetching configuration'),
        NotAsked: () => tooltip(iconWarning(), 'No configuration was asked for'),
    });
