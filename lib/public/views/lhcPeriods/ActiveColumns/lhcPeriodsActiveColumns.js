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
        format: (name) => h('', [name, frontLink('runs', 'runs-per-period', { lhcPeriodName: name }, { class: 'btn mh2' })]),
        filter: ({ namesFilterModel }) => textFilter(
            namesFilterModel,
            { class: 'w-75 mt1', placeholder: 'e.g. LHC22a, lhc23b, ...' },
        ),
    },

    year: {
        name: 'Year',
        visible: true,
        format: (_, lhcPeriod) => formatLhcPeriodYear(lhcPeriod.name),
        filter: ({ yearsFilterModel }) => textFilter(
            yearsFilterModel,
            { class: 'w-75 mt1', placeholder: 'e.g. 2022, 2023, ...' },
        ),
    },

    beamType: {
        name: 'Beam Type',
        visible: true,
        format: (beamType) => beamType || '-',
        filter: ({ beamTypesFilterModel }) => textFilter(
            beamTypesFilterModel,
            { class: 'w-75 mt1', placeholder: 'e.g. pp, PbPb' },
        ),
    },

    avgCenterOfMassEnergy: {
        name: ['Avg ', h('img', { src: '/assets/center-of-mass-energy.svg' }), ' [GeV]'],
        visible: true,
        format: (avgCenterOfMassEnergy) => avgCenterOfMassEnergy ? `${Number(avgCenterOfMassEnergy).toFixed(2)}` : '-',
    },

    distinctEnergies: {
        name: ['Distinct Beam Energies [GeV]'],
        visible: true,
        balloon: true,
        format: formatDistinctLhcBeamEnergies,
    },
};
