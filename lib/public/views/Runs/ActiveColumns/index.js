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
 * Method to retrieve the list of active columns for a generic table component
 * @return {Object} A collection of columns with parameters for the Run table
 */
const activeColumns = () => ({
    id: {
        name: 'ID',
        visible: false,
        primary: true,
    },
    runNumber: {
        name: 'Run',
        visible: true,
        size: 'cell-s',
    },
    tags: {
        name: 'Tags',
        visible: true,
        size: 'cell-l',
        format: (tags) => tags ? tags.map(({ text }) => text).join(', ') : '',
    },
    timeO2Start: {
        name: 'O2 Start',
        visible: true,
        size: 'cell-l',
        format: (date) => new Date(date).toLocaleString(),
    },
    timeO2End: {
        name: 'O2 Stop',
        visible: true,
        size: 'cell-l',
        format: (date) => new Date(date).toLocaleString(),
    },
    timeTrgStart: {
        name: 'TRG Start',
        visible: true,
        size: 'cell-l',
        format: (date) => new Date(date).toLocaleString(),
    },
    timeTrgEnd: {
        name: 'TRG Stop',
        visible: true,
        size: 'cell-l',
        format: (date) => new Date(date).toLocaleString(),
    },
    activityId: {
        name: 'Activity Id',
        visible: true,
        size: 'cell-m',
    },
    runType: {
        name: 'Run Type',
        visible: true,
        size: 'cell-l',
    },
    runQuality: {
        name: 'Run Quality',
        visible: true,
        size: 'cell-m',
    },
    nDetectors: {
        name: '# of Detector',
        visible: true,
        size: 'cell-s',
    },
    nFlps: {
        name: '# of Flps',
        visible: true,
        size: 'cell-s',
    },
    nEpns: {
        name: '# of Epns',
        visible: true,
        size: 'cell-s',
    },
    nSubtimeframes: {
        name: '# of STFs',
        visible: true,
        size: 'cell-m',
    },
    bytesReadOut: {
        name: 'Readout Data',
        visible: true,
        size: 'cell-m',
    },

});

export default activeColumns;
