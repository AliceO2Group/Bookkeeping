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
            date ? new Date(date).toLocaleString('en-GB', { timeStyle: 'medium', dateStyle: 'short' }) : '-',
    },
    timeTrgEnd: {
        name: 'TRG Stop',
        visible: true,
        size: 'cell-l',
        format: (date) =>
            date ? new Date(date).toLocaleString('en-GB', { timeStyle: 'medium', dateStyle: 'short' }) : '-',
    },
    environmentId: {
        name: 'Environment Id',
        visible: true,
        size: 'cell-m',
    },

    /*
     * RunType: {
     *     name: 'Run Type',
     *     visible: false,
     *     size: 'cell-l',
     * },
     * runQuality: {
     *     name: 'Run Quality',
     *     visible: false,
     *     size: 'cell-m',
     * },
     */
    nDetectors: {
        name: 'Number of Detectors',
        visible: true,
        size: 'cell-m',
    },
    nFlps: {
        name: 'Number of Flps',
        visible: true,
        size: 'cell-s',
    },

    /*
     * NEpns: {
     *     name: 'Number of Epns',
     *     visible: false,
     *     size: 'cell-s',
     * },
     * nSubtimeframes: {
     *     name: 'Number of STFs',
     *     visible: false,
     *     size: 'cell-s',
     * },
     * bytesReadOut: {
     *     name: 'Readout Data',
     *     visible: false,
     *     size: 'cell-m',
     * },
     */
    dd_flp: {
        name: 'Data Distribution (FLP)',
        visible: true,
        size: 'cell-s',
        format: (boolean) =>
            boolean ? 'On' : 'Off',
    },
    dcs: {
        name: 'DCS',
        visible: true,
        size: 'cell-s',
        format: (boolean) =>
            boolean ? 'On' : 'Off',
    },
    epn: {
        name: 'EPN',
        visible: true,
        size: 'cell-s',
        format: (boolean) =>
            boolean ? 'On' : 'Off',
    },
    epnTopology: {
        name: 'EPN Topology',
        visible: true,
        size: 'cell-m',
    },
    detectors: {
        name: 'Detectors',
        visible: true,
        size: 'cell-m',
        format: (detectors) => `${detectors}, `,
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
            name,
            format,
        },
    ]) =>
        h(`.w-30rem.flex-row.justify-between#Flp-${key}`, h('b', `${name}:`), format ? format(post[key]) : post[key])));
};

export default entry;
