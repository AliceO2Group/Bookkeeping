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
 * Display configuration of LHC fills data specific for a given run
 */
export const runLhcFillDisplayConfiguration = {
    aliceDipoleCurrent: {
        name: 'ALICE Dipole Current',
    },
    aliceDipolePolarity: {
        name: 'ALICE Dipole Polarity',
    },
    aliceL3Current: {
        name: 'ALICE L3 Current',
    },
    aliceL3Polarity: {
        name: 'ALICE L3 Polarity',
    },
    lhcBeamEnergy: {
        name: 'LHC Beam Energy',
        format: (value) => value ? `${value} GeV` : '-',
    },
    lhcBeamMode: {
        name: 'LHC Beam Mode',
    },
    lhcBetaStar: {
        name: 'LHC Beta Star',
    },
};
