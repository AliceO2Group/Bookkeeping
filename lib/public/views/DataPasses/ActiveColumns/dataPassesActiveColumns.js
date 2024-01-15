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
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { textFilter } from '../../../components/Filters/common/filters/textFilter.js';

/**
 * List of active columns for a generic periods table
 */
export const dataPassesActiveColumns = {
    name: {
        name: 'Name',
        visible: true,
        format: (id) => h('.flex-row.flex-wrap', [
            h('.ph1.mh1.w-10', id),
            h('.mh4'),
            frontLink('runs', 'runs-per-data-pass', { dataPassId: id }, { class: 'btn mh1' }),
        ]),
        sortable: true,
        filter: ({ namesFilterModel }) => textFilter(
            namesFilterModel,
            { class: 'w-75 mt1', placeholder: 'e.g. LHC22a_apass1, lhc23b, ...' },
        ),
    },

    description: {
        name: 'Description',
        visible: true,
        sortable: false,
    },

    outputSize: {
        name: 'Output Size',
        visible: true,
        sortable: true,
    },

    reconstructedEventsCount: {
        name: 'Reconstructed Events Count',
        visible: true,
        sortable: true,
    },
};
