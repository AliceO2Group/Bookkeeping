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

/**
 * List of active columns for a generic periods table
 */
export const lhcPeriodsActiveColumns = {
    name: {
        name: 'Name',
        visible: true,
    },

    avgCenterOfMassEnergy: {
        name: 'Mean energy [GeV]',
        visible: true,
        format: (avgEnergy) => avgEnergy ? `${Number(avgEnergy).toFixed(2)}` : '.',
    },

    distinctCenterOfMassEnergies: {
        name: 'Distinct Energies [GeV]',
        visible: true,
        format: (distinctCenterOfMassEnergies) => distinctCenterOfMassEnergies?.length > 0 ? `${distinctCenterOfMassEnergies}` : '.',
    },
};
