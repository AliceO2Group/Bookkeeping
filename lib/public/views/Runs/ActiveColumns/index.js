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
import runNumberFilter from '../../../components/Filters/RunsFilter/runNumber.js';
import tagsFilter from '../../../components/Filters/RunsFilter/tags.js';
import o2startFilter from '../../../components/Filters/RunsFilter/o2start.js';
import o2endFilter from '../../../components/Filters/RunsFilter/o2stop.js';
import environmentIdFilter from '../../../components/Filters/RunsFilter/environmentId.js';
import nDetectorsFilter from '../../../components/Filters/RunsFilter/nDetectors.js';
import nFlpsFilter from '../../../components/Filters/RunsFilter/nFlps.js';
import epnTopologyFilter from '../../../components/Filters/RunsFilter/epnTopology.js';
import detectorsFilter from '../../../components/Filters/RunsFilter/detectors.js';
import ddflpFilter from '../../../components/Filters/RunsFilter/ddflp.js';
import dcsFilter from '../../../components/Filters/RunsFilter/dcs.js';
import epnFilter from '../../../components/Filters/RunsFilter/epn.js';

/**
 * Method to retrieve the list of active columns for a generic table component
 * @param {Object} model The global model object
 * @return {Object} A collection of columns with parameters for the Run table
 */
const activeColumns = (model) => ({
    id: {
        name: 'ID',
        visible: false,
        primary: true,
    },
    runNumber: {
        name: 'Run',
        visible: true,
        size: 'cell-s',
        filter: runNumberFilter(model),
    },
    detectors: {
        name: 'Detectors',
        visible: true,
        size: 'cell-m',
        format: (detectors) => `${detectors.toString()}`,
        filter: detectorsFilter(model),
    },
    tags: {
        name: 'Tags',
        visible: true,
        size: 'cell-l',
        format: (tags) => tags.map(({ text }) => text).join(', '),
        filter: tagsFilter(model),
    },
    timeO2Start: {
        name: 'O2 Start',
        visible: true,
        size: 'cell-l',
        format: (date) =>
            date ? new Date(date).toLocaleString('en-GB', { timeStyle: 'medium', dateStyle: 'short' }) : '-',
        filter: o2startFilter(model),
    },
    timeO2End: {
        name: 'O2 Stop',
        visible: true,
        size: 'cell-l',
        format: (date) =>
            date ? new Date(date).toLocaleString('en-GB', { timeStyle: 'medium', dateStyle: 'short' }) : '-',
        filter: o2endFilter(model),
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
        filter: environmentIdFilter(model),
    },
    runType: {
        name: 'Run Type',
        visible: false,
        size: 'cell-l',
    },
    runQuality: {
        name: 'Run Quality',
        visible: false,
        size: 'cell-m',
    },
    nDetectors: {
        name: '# of Detectors',
        visible: true,
        size: 'cell-s',
        filter: nDetectorsFilter(model),
    },
    nFlps: {
        name: '# of Flps',
        visible: true,
        size: 'cell-s',
        filter: nFlpsFilter(model),
    },
    nEpns: {
        name: '# of Epns',
        visible: false,
        size: 'cell-s',
    },
    nSubtimeframes: {
        name: '# of STFs',
        visible: false,
        size: 'cell-s',
    },
    bytesReadOut: {
        name: 'Readout Data',
        visible: false,
        size: 'cell-m',
    },
    dd_flp: {
        name: 'Data Distribution (FLP)',
        visible: true,
        size: 'cell-m',
        format: (boolean) =>
            boolean ? 'On' : 'Off',
        filter: ddflpFilter(model),
    },
    dcs: {
        name: 'DCS',
        visible: true,
        size: 'cell-s',
        format: (boolean) =>
            boolean ? 'On' : 'Off',
        filter: dcsFilter(model),
    },
    epn: {
        name: 'EPN',
        visible: true,
        size: 'cell-s',
        format: (boolean) =>
            boolean ? 'On' : 'Off',
        filter: epnFilter(model),
    },
    epnTopology: {
        name: 'EPN Topology',
        visible: true,
        size: 'cell-m',
        filter: epnTopologyFilter(model),
    },
    actions: {
        name: 'Actions',
        visible: true,
        sortable: false,
        size: 'cell-m',
        format: (_, run) =>
            h(`button#btn${run.id}.btn.btn-primary.clickable`, {
                onclick: () => model.router.go(`?page=run-detail&id=${run.id}`) }, 'More'),
    },
});

/**
 * Method to retrieve the list of active home overview columns for a generic table component
 * @param {Object} model The global model object
 * @return {Object} A collection of columns with parameters for the Run table
 */
export const activeHomeOverviewColumns = (model) => ({
    runNumber: {
        name: 'Run',
        visible: true,
        size: 'cell-s',
    },
    timeO2Start: {
        name: 'O2 Start',
        visible: true,
        size: 'cell-l',
        format: (date) =>
            date ? new Date(date).toLocaleString('en-GB', { timeStyle: 'medium', dateStyle: 'medium' }) : '-',
    },
    timeO2End: {
        name: 'O2 Stop',
        visible: true,
        size: 'cell-l',
        format: (date) =>
            date ? new Date(date).toLocaleString('en-GB', { timeStyle: 'medium', dateStyle: 'medium' }) : '-',
    },
    actions: {
        name: 'Actions',
        visible: true,
        sortable: false,
        size: 'cell-s',
        format: (_, run) =>
            h(`button#btn${run.id}.btn.btn-primary.clickable`, {
                onclick: () => model.router.go(`?page=run-detail&id=${run.id}`) }, 'More'),
    },
});

export default activeColumns;
