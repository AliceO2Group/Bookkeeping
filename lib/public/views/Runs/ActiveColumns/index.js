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

import tagsFilter from '../../../components/Filters/tags.js';

/**
 * Method to retrieve the list of active columns for a generic table component
 * @param {Object} model The global model object
 * @return {Object} A collection of columns with parameters for the Run table
 */
const activeColumns = (model) => ({
    runNumber: {
        name: 'Run Number',
        visible: true,
    },
    timeO2Start: {
        name: 'Time 02 Start',
        visible: true,
        size: 'cell-l',
    },
    timeO2End: {
        name: 'Time 02 End',
        visible: true,
        size: 'cell-l',
    },
    timeTrgStart: {
        name: 'Time Trigger Start',
        visible: true,
        size: 'cell-l',
    },
    timeTrgEnd: {
        name: 'Time Trigger End',
        visible: true,
        size: 'cell-l',
    },
    activityId: {
        name: 'Activity Id',
        visible: true,
        size: 'cell-l',
    },
    runType: {
        name: 'Run Type',
        visible: true,
        size: 'cell-l',
    },
    runQuality: {
        name: 'Run Quality',
        visible: true,
        size: 'cell-l',
    },
    nDetectors: {
        name: 'Number of Detectors',
        visible: true,
        size: 'cell-l',
        expand: true,
    },
    nFlps: {
        name: 'Number of Flps',
        visible: true,
        size: 'cell-l',
        expand: true,
    },
    nEpns: {
        name: 'Number of Epns',
        visible: true,
        size: 'cell-l',
        expand: true,
    },
    nSubtimeframes: {
        name: 'Number of Subtimeframes',
        visible: true,
        size: 'cell-l',
        expand: true,
    },
    bytesReadOut: {
        name: 'Read Out Volume in bytes',
        visible: true,
        size: 'cell-l',
        expand: true,
    },
    bytesTimeframe_builder: {
        name: 'Timeframe builder in bytes',
        visible: true,
        size: 'cell-l',
        expand: true,
    },
    tags: {
        name: 'Tags',
        visible: true,
        size: 'cell-m',
        format: (tags) => tags.map(({ text }) => text).join(', '),
        filter: tagsFilter(model),
    },

});

export default activeColumns;
