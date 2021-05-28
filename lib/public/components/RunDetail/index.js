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

/**
 * Method to retrieve the information for a specific run
 * @return {Object} A collection of data with parameters for the Run detail page.
 */
const activeFields = () => ({
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
        format: (tags) => tags.map(({ text }) => text).join(', '),
    },
    timeO2Start: {
        name: 'O2 Start',
        visible: true,
        size: 'cell-l',
        format: (date) =>
            date ? new Date(date).toLocaleString('en-GB', { timeStyle: 'medium', dateStyle: 'short' }) : '-',
    },
    timeO2End: {
        name: 'O2 Stop',
        visible: true,
        size: 'cell-l',
        format: (date) =>
            date ? new Date(date).toLocaleString('en-GB', { timeStyle: 'medium', dateStyle: 'short' }) : '-',
    },
    timeTrgStart: {
        name: 'TRG Start',
        visible: true,
        size: 'cell-l',
        format: (date) =>
            date ? new Date(date).toLocaleString('en-GB', { timeStyle: 'short', dateStyle: 'short' }) : '-',
    },
    timeTrgEnd: {
        name: 'TRG Stop',
        visible: true,
        size: 'cell-l',
        format: (date) =>
            date ? new Date(date).toLocaleString('en-GB', { timeStyle: 'short', dateStyle: 'short' }) : '-',
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

/**
 * A singular detail page which provides information about a run
 *
 * @param {Object} model Pass the model to access the defined functions.
 * @param {Object} post all data related to the post
 * @return {vnode} Returns a post
 */
const entry = (model, post) => {
    const postFields = activeFields(model);

    return h('#Run', Object.entries(postFields).map(([
        key, {
            format,
        },
    ]) =>
        h('.w-30rem.flex-row.justify-between', {}, h('b', `${key}: `), format ? format(post[key]) : post[key])));
};

export default entry;
