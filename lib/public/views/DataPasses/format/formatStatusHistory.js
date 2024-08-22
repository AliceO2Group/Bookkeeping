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

import { tooltip } from '../../../components/common/popover/tooltip.js';
import { DataPassVersionStatus } from '../../../domain/enums/DataPassVersionStatus.js';
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';
import { h, switchCase } from '/js/src/index.js';

/**
 * Render data pass status history
 *
 * @param {DataPass} dataPass data pass
 * @return {Component} data pass name display
 */
export const formatDataPassStatusHistory = ({ versions }) => versions?.map(({ statusHistory }) => h(
    '.flex-row.g1',
    statusHistory
        .map(({ status, createdAt }) => switchCase(status, {
            [DataPassVersionStatus.RUNNING]: tooltip(
                h('.primary', 'R'),
                `Production was started before ${formatTimestamp(createdAt, true)}`,
            ),
            [DataPassVersionStatus.DELETED]: tooltip(
                h('.success', 'D'),
                `Production was deleted before ${formatTimestamp(createdAt, true)}`,
            ),
        }))
        .flatMap((statusItem) => ['-', statusItem])
        .slice(1),
));
