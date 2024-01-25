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
import { formatDistinctLhcBeamEnergies } from '../format/formatDistinctLhcBeamEnergies.js';
import { formatLhcPeriodYear } from '../format/formatYear.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { textFilter } from '../../../components/Filters/common/filters/textFilter.js';

/**
 * List of active columns for a generic periods table
 */
export const lhcPeriodsActiveColumns = {
    name: {
        name: 'Name',
        visible: true,
        format: (name, { id, runsCount }) => h('.flex-row.flex-wrap', [
            h('.ph1.mh1.w-10', name),
            h('.mh4'),
            frontLink(
                ['Runs', h('sub', `[${runsCount}]`)],
                'runs-per-lhc-period',
                { lhcPeriodName: name },
                { class: `btn mh1 ${runsCount > 0 ? 'bg-light-blue' : ''}` },
            ),
            frontLink('Data Passes', 'data-passes-per-lhc-period-overview', { lhcPeriodId: id }, { class: 'btn mh1' }),
            frontLink('MC', 'simulation-passes-per-lhc-period-overview', { lhcPeriodId: id }, { class: 'btn mh1' }),
        ]),
        sortable: true,
        filter: ({ namesFilterModel }) => textFilter(
            namesFilterModel,
            { class: 'w-75 mt1', placeholder: 'e.g. LHC22a, lhc23b, ...' },
        ),
    },

    avgCenterOfMassEnergy: {
        name: ['Avg ', h('img', { src: '/assets/center-of-mass-energy.svg' }), ' [GeV]'],
        visible: true,
        sortable: true,
        format: (avgCenterOfMassEnergy) => avgCenterOfMassEnergy ? `${Number(avgCenterOfMassEnergy).toFixed(2)}` : '-',
    },

    year: {
        name: 'Year',
        visible: true,
        sortable: true,
        format: (_, lhcPeriod) => formatLhcPeriodYear(lhcPeriod.name),
        filter: ({ yearsFilterModel }) => textFilter(
            yearsFilterModel,
            { class: 'w-75 mt1', placeholder: 'e.g. 2022, 2023, ...' },
        ),
    },

    beamType: {
        name: 'Beam Type',
        visible: true,
        sortable: true,
        format: (beamType) => beamType || '-',
        filter: ({ beamTypesFilterModel }) => textFilter(
            beamTypesFilterModel,
            { class: 'w-75 mt1', placeholder: 'e.g. pp, PbPb' },
        ),
    },

    distinctEnergies: {
        name: ['Distinct Beam Energies [GeV]'],
        visible: true,
        sortable: false,
        balloon: true,
        format: formatDistinctLhcBeamEnergies,
    },
};
