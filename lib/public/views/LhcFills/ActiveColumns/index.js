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

import { formatTimestamp } from '../../../utilities/formatTimestamp.js';

/**
 * Method to receive the list of active columns for a generic Environments component
 * @param {Object} _model The global model object
 * @return {Object} A collection of columns.
 */
const activeColumns = (_model) => ({
    fillNumber: {
        name: 'Fill Number',
        visible: true,
        primary: true,
        size: 'w-10',
    },
    stableBeamsStart: {
        name: 'Stable beams start',
        visible: true,
        size: 'w-15',
        format: (timestamp) => formatTimestamp(timestamp),
    },
    stableBeamsEnd: {
        name: 'Stable beams end',
        visible: true,
        size: 'w-15',
        format: (timestamp) => formatTimestamp(timestamp),
    },
    stableBeamsDuration: {
        name: 'Beams Duration',
        visible: true,
        size: 'w-15',
        format: (time) => time ? `${time} sec` : '-',
    },
    beamType: {
        name: 'Beam Type',
        visible: true,
        size: 'w-15',
        format: (value) => value ? value : '-',
    },
    fillingSchemeName: {
        name: 'Scheme name',
        visible: true,
        size: 'w-20',
        format: (value) => value ? value : '-',
    },
    runs: {
        name: 'Runs',
        visible: true,
        sortable: false,
        size: 'w-15',
        title: true,
        format: (runs) => runs && runs.length > 0 ? runs.map(({ runNumber }) => runNumber).join(', ') : '-',
        balloon: true,
    },
});

export default activeColumns;
