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

/**
 * Method to receive the list of active columns for a generic Environments component
 * @param {Object} _model The global model object
 * @return {Object} A collection of columns.
 */
const activeColumns = (_model) => ({
    id: {
        name: 'Lhc Data',
        visible: false,
        primary: true,
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
});

export default activeColumns;
