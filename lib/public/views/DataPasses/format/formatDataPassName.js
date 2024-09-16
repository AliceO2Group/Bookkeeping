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

import { badge } from '../../../components/common/badge.js';
import { Color } from '../../../components/common/colors.js';
import { tooltip } from '../../../components/common/popover/tooltip.js';
import { DataPassVersionStatus } from '../../../domain/enums/DataPassVersionStatus.js';
import { SkimmingStage } from '../../../domain/enums/SkimmingStage.js';
import { h } from '/js/src/index.js';

/**
 * Render data pass name display
 *
 * @param {DataPass} dataPass data pass
 * @return {Component} data pass name display
 */
export const formatDataPassName = ({ name, versions, skimmingStage }) => {
    const allDeleted = versions?.every(({ statusHistory }) => statusHistory[statusHistory.length - 1].status === DataPassVersionStatus.DELETED);
    return h('.flex-row.g1', [
        allDeleted ? tooltip(badge(h('.gray-darker', 'deleted')), 'The production was removed from MonALISA') : null,
        name,
        skimmingStage === SkimmingStage.SKIMMABLE ? badge('Skimmable', { color: Color.SUCCESS }) : null,
    ]);
};
