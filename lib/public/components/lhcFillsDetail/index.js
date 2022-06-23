/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import format from '../Detail/index.js';

/**
 * The active fields we want to display
 * @param  {Object} _model the global model object
 * @returns {Object} Object of active fields
 */
const activeFields = (_model) => ({
    id: {
        name: 'LHC Data',
        visible: false,
        primary: true,
        format: () => null,
    },
    stableBeamsStart: {
        name: 'Stable beams start',
        visible: true,
        size: 'cell-s',
        format: (date) =>
            date ? new Date(date).toLocaleString('en-GB', { timeStyle: 'medium', dateStyle: 'short' }) : '-',
    },
    stableBeamsEnd: {
        name: 'Stable beams end',
        visible: true,
        size: 'cell-s',
        format: (date) =>
            date ? new Date(date).toLocaleString('en-GB', { timeStyle: 'medium', dateStyle: 'short' }) : '-',
    },
    stableBeamsDuration: {
        name: 'Beams Duration',
        visible: true,
        size: 'cell-s',
        format: (time) => time ? `${time} sec` : '-',
    },
    beamType: {
        name: 'Beam Type',
        visible: true,
        size: 'cell-s',
        format: (value) => value ? value : '-',
    },
    fillingSchemeName: {
        name: 'Scheme name',
        visible: true,
        size: 'cell-s',
        format: (value) => value ? value : '-',
    },
    aliceDipoleCurrent: {
        name: 'ALICE Dipole Current',
        visible: true,
        format: (value) => value ? value : '-',
    },
    aliceDipolePolarity: {
        name: 'Dipole Polarity',
        visible: true,
        format: (value) => value ? value : '-',
    },
    aliceL3Current: {
        name: 'ALICE L3 Current',
        format: (value) => value ? value : '-',
    },
    aliceL3Polarity: {
        name: 'L3 Polarity',
        format: (value) => value ? value : '-',
    },
    lhcBeamEnergy: {
        name: 'LHC Beam Energy',
        visible: true,
        size: 'cell-m',
        format: (value) => value ? `${value} GeV` : '-',
    },
    lhcBeamMode: {
        name: 'LHC Beam Mode',
        visible: true,
        size: 'cell-m',
        format: (value) => value ? value : '-',
    },
    lhcBetaStar: {
        name: 'LHC Beta Star',
        visible: true,
        size: 'cell-m',
        format: (value) => value ? value : '-',
    },
});

/**
 * Get user data.
 * @param {Object} model Model
 * @param {Object} value The fetched lhcValue
 * @returns {Object} Html of the lhc Fills data
 */
const lhcFillDetail = (model, value) => {
    const postFields = activeFields(model);
    return format(postFields, value, 'lhcFill');
};

export default lhcFillDetail;
