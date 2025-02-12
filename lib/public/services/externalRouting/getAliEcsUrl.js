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
import { buildUrl } from '/js/src/index.js';

/**
 * Create link to ECS environment page if ECS URL is available in service configuration
 * @param {string} environmentId the environment id
 * @return {Component} link
 */
export const getAliEcsUrl = (environmentId) =>
    configurationService.configuration$.getCurrent().match({
        Success: ({ AliEcsGuiUrl }) => AliEcsGuiUrl
            ? buildUrl(AliEcsGuiUrl, { page: 'environment', id: environmentId })
            : null,
        Other: () => null,
    });
