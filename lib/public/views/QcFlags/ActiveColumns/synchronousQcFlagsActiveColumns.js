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

import { h } from '/js/src/index.js';
import { qcFlagsActiveColumns } from './qcFlagsActiveColumns.js';
import { formatQcFlagStart } from '../format/formatQcFlagStart.js';
import { formatQcFlagEnd } from '../format/formatQcFlagEnd.js';
import { formatQcFlagCreatedBy } from '../format/formatQcFlagCreatedBy.js';
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';

/**
 * Active columns configuration for synchronous QC flags table
 */
export const synchronousQcFlagsActiveColumns = {
    id: {
        name: 'Id',
        visible: false,
    },
    flagType: {
        ...qcFlagsActiveColumns.flagType,
        classes: 'w-15',
    },
    from: {
        name: 'From/To',
        visible: true,
        format: (_, qcFlag) => h('', [
            h('.flex-row', ['From: ', formatQcFlagStart(qcFlag, true)]),
            h('.flex-row', ['To: ', formatQcFlagEnd(qcFlag, true)]),
        ]),
        classes: 'w-15',
    },
    comment: {
        ...qcFlagsActiveColumns.comment,
        balloon: true,
    },
    deleted: {
        name: 'Deleted',
        visible: true,
        classes: 'w-5',
        format: (deleted) => deleted ? h('.danger', 'Yes') : 'No',
    },
    createdBy: {
        name: 'Created',
        visible: true,
        balloon: true,
        format: (_, qcFlag) => h('', [
            h('.flex-row', ['By: ', formatQcFlagCreatedBy(qcFlag)]),
            h('.flex-row', ['At: ', formatTimestamp(qcFlag.createdAt)]),
        ]),
    },
};
