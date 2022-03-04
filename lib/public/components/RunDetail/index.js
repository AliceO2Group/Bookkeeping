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
 * @param {Object} model Pass the model to access the defined functions.
 * @return {Object} A collection of data with parameters for the Run detail page.
 */
const activeFields = (model) => ({
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
    detectors: {
        name: 'Detectors',
        visible: true,
        size: 'cell-m',
        format: (detectors) => detectors && detectors.length > 0 ? `${detectors.toString()}` : '-',
    },
    tags: {
        name: 'Tags',
        visible: true,
        size: 'cell-l',
        format: (tags) => tags && tags.length > 0 ? tags.map(({ text }) => text).join(', ') : '-',
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
    runQuality: {
        name: 'Run Quality',
        visible: true,
        size: 'cell-m',
        format: (runQuality) => model.runs.isEditModeEnabled ? [
            h('select.form-control.w-15#runQualitySelect', {
                onchange: ({ target }) => {
                    model.runs.runChanges = { key: 'runQuality', value: target.value };
                },
            }, [
                h('option#runQualityGood', {
                    value: 'good', selected: model.runs.run.payload.runQuality === 'good' }, 'good'),
                h('option#runQualityBad', {
                    value: 'bad', selected: model.runs.run.payload.runQuality === 'bad' }, 'bad'),
                h('option#runQualityTest', {
                    value: 'test', selected: model.runs.run.payload.runQuality === 'test' }, 'test'),
            ]),
        ] : runQuality ? h('.badge.white', {
            class: runQuality === 'good' ? 'bg-success' : runQuality === 'bad' ? 'bg-danger' : 'bg-gray-darker',
        }, runQuality) : '-',
    },
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
        format: (boolean) => boolean ? 'On' : 'Off',
    },
    dcs: {
        name: 'DCS',
        visible: true,
        size: 'cell-s',
        format: (boolean) => boolean ? 'On' : 'Off',
    },
    epn: {
        name: 'EPN',
        visible: true,
        size: 'cell-s',
        format: (boolean) => boolean ? 'On' : 'Off',
    },
    epnTopology: {
        name: 'EPN Topology',
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
            name,
            format,
        },
    ]) =>
        h(`.flex-row.justify-between#Flp-${key}`, h('b', `${name}:`), format ? format(post[key]) : post[key])));
};

export default entry;
