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
import { isRunRunning } from '../../../utilities/formatting/isRunRunning.js';
const { CONFIGURATION: { ALI_ECS_GUI_URL } } = window;
import { h } from '/js/src/index.js';

/**
 * Format environment links
 * @param {object} run the run
 * @return {Componenet} links
 */
export const displayEnvironmentLinks = ({ environmentId: id, ...run }) => isRunRunning(run)
    ? h(
        '.flex-row.g2.items-baseline',
        [
            h('h4', absoluteFrontLink('ECS', `${ALI_ECS_GUI_URL}?page=environment&id=${id}`)),
            frontLink(id, 'env-details', { environmentId: id }),
        ],
    ) : frontLink(id, 'env-details', { environmentId: id });
