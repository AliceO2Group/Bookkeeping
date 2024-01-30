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
import { textFilter } from '../../../components/Filters/common/filters/textFilter.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';

/**
 * List of active columns for a generic periods table
 */
export const lhcPeriodsActiveColumns = {
    name: {
        name: 'Name',
        visible: true,
        sortable: true,
        filter: ({ namesFilterModel }) => textFilter(
            namesFilterModel,
            { class: 'w-75 mt1', placeholder: 'e.g. LHC22a, lhc23b, ...' },
        ),
        classes: 'w-10',
    },

    associatedRuns: {
        name: '',
        visible: true,
        format: (name, { runsCount }) =>
            runsCount === 0
                ? ['Runs', h('.badge', `(${runsCount})`)]
                : frontLink(
                    ['Runs', h('.badge', `(${runsCount})`)],
                    'runs-per-lhc-period',
                    { lhcPeriodName: name },
                ),
        classes: 'w-5',
    },

    associatedDataPasses: {
        name: '',
        visible: true,
        format: (_, { id, dataPassesCount }) =>
            dataPassesCount === 0
                ? ['Data Passes', h('.badge', `(${dataPassesCount})`)]
                : frontLink(
                    ['Data Passes', h('.badge', `(${dataPassesCount})`)],
                    'data-passes-per-lhc-period-overview',
                    { lhcPeriodId: id },
                ),
        classes: 'w-10',
    },

    avgCenterOfMassEnergy: {
        name: ['Avg ', h('img', { src: '/assets/center-of-mass-energy.svg' }), ' [GeV]'],
        visible: true,
        sortable: true,
        format: (avgCenterOfMassEnergy) => avgCenterOfMassEnergy ? `${Number(avgCenterOfMassEnergy).toFixed(2)}` : '-',
        classes: 'w-15',
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
        classes: 'w-15',
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
        classes: 'w-15',
    },

    distinctEnergies: {
        name: ['Distinct Beam Energies [GeV]'],
        visible: true,
        sortable: false,
        balloon: true,
        format: formatDistinctLhcBeamEnergies,
    },
};
