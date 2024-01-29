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
import { textFilter } from '../../../components/Filters/common/filters/textFilter.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';

/**
 * List of active columns for a generic data passes table
 */
export const dataPassesActiveColumns = {
    name: {
        name: 'Name',
        visible: true,
        format: (name, { runsCount }) => h('.flex-row.flex-wrap', [
            h('.ph1.mh1.w-50.text-ellipsis', name),
            h('.mh4'),
            frontLink(
                ['Runs', h('.badge', `(${runsCount})`)],
                'runs-per-data-pass',
                { dataPassName: name },
                { class: `btn mh1 ${runsCount === 0 ? 'gray-darker' : ''}` },
            ),
        ]),
        sortable: true,
        filter: ({ namesFilterModel }) => textFilter(
            namesFilterModel,
            { class: 'w-75 mt1', placeholder: 'e.g. LHC22a_apass1, ...' },
        ),
    },

    description: {
        name: 'Description',
        visible: true,
        sortable: false,
    },

    reconstructedEventsCount: {
        name: 'Reconstructed Events',
        format: (reconstructedEventsCount) => reconstructedEventsCount ? reconstructedEventsCount.toLocaleString('en-US') : '-',
        visible: true,
        sortable: true,
    },

    outputSize: {
        name: 'Output Size [B]',
        visible: true,
        format: (outputSize) => outputSize ? outputSize.toLocaleString('en-US') : '-',
        sortable: true,
    },

};
