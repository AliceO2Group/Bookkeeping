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

import { configurationService } from '../../../services/configurationService.js';
window.configurationService = configurationService
import { h } from '/js/src/index.js';
import { buildUrl } from '../../../utilities/fetch/buildUrl.js';

/**
 * Format ECS environment link
 * @param {string} environmentId the environment id
 * @return {Componenet} link
 */
export const getAliEcsEnvironmentLink = (environmentId) =>
    configurationService.configuration$.getCurrent().match({
        Success: ({ AliEcsGuiUrl }) => AliEcsGuiUrl
            ? h(
                'a',
                { target: '_blank', href: buildUrl(AliEcsGuiUrl, { page: 'environment', id: environmentId }) },
                'ECS',
            )
            : null,
        Other: () => null,
    });
