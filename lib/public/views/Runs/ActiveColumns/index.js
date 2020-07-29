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
 * @param {Object} model The global model object
 * @return {Object} A collection of columns with parameters for the Run table
 */
const activeColumns = () => ({
    runNumber: {
        name: 'Run Number',
        visible: true,
        size: 'cell-s',
    },
    timeO2Start: {
        name: 'Time O2 Start',
        visible: true,
        size: 'cell-l',
        format: (date) => new Date(date).toLocaleString(),
    },
    timeO2End: {
        name: 'Time O2 End',
        visible: true,
        size: 'cell-l',
        format: (date) => new Date(date).toLocaleString(),
    },
    timeTrgStart: {
        name: 'Time Trigger Start',
        visible: true,
        size: 'cell-l',
        format: (date) => new Date(date).toLocaleString(),
    },
    timeTrgEnd: {
        name: 'Time Trigger End',
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
        name: '# of Subtimeframes',
        visible: true,
        size: 'cell-m',
    },
    bytesReadOut: {
        name: 'ReadOut in bytes',
        visible: true,
        size: 'cell-m',
    },

});

export default activeColumns;
