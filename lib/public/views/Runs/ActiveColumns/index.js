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
import runQuality from '../../../components/Filters/RunsFilter/runQuality.js';

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
        size: 'w-5 f6 w-wrapped',
        filter: runNumberFilter(model),
    },
    detectors: {
        name: 'Detectors',
        visible: true,
        size: 'w-10 f6 w-wrapped',
        format: (detectors) => detectors && detectors.length > 0 ? `${detectors.toString()}` : '-',
        filter: detectorsFilter(model),
    },
    tags: {
        name: 'Tags',
        visible: true,
        size: 'w-10 f6 w-wrapped',
        format: (tags) => tags && tags.length > 0 ? tags.map(({ text }) => text).join(', ') : '-',
        filter: tagsFilter(model),
    },
    timeO2Start: {
        name: 'O2 Start Interval',
        visible: true,
        size: 'w-10 f6 w-wrapped',
        format: (date) =>
            date ? new Date(date).toLocaleString('en-GB', { timeStyle: 'medium', dateStyle: 'short' }).split(',').join('\n') : '-',
        filter: o2startFilter(model),
    },
    timeO2End: {
        name: 'O2 Stop Interval',
        visible: true,
        size: 'w-10 f6 w-wrapped',
        format: (date) =>
            date ? new Date(date).toLocaleString('en-GB', { timeStyle: 'medium', dateStyle: 'short' }) : '-',
        filter: o2endFilter(model),
    },
    timeTrgStart: {
        name: 'TRG Start',
        visible: false,
        size: 'w-10 f6 w-wrapped',
        format: (date) =>
            date ? new Date(date).toLocaleString('en-GB', { timeStyle: 'medium', dateStyle: 'short' }) : '-',
    },
    timeTrgEnd: {
        name: 'TRG Stop',
        visible: false,
        size: 'w-10 f6 w-wrapped',
        format: (date) =>
            date ? new Date(date).toLocaleString('en-GB', { timeStyle: 'medium', dateStyle: 'short' }) : '-',
    },
    environmentId: {
        name: 'Environment ID',
        visible: true,
        size: 'w-7 f6 w-wrapped',
        filter: environmentIdFilter(model),
    },
    runType: {
        name: 'Run Type',
        visible: false,
        size: 'cell-l f6 w-wrapped',
    },
    runQuality: {
        name: 'Run Quality',
        visible: true,
        size: 'w-10 f6 w-wrapped',
        format: (runQuality) => runQuality ? runQuality : '-',
        filter: runQuality(model),
    },
    nDetectors: {
        name: 'DETs #',
        visible: true,
        size: 'w-2 f6 w-wrapped',
        filter: nDetectorsFilter(model),
    },
    nFlps: {
        name: 'FLPs #',
        visible: true,
        size: 'w-2 f6 w-wrapped',
        filter: nFlpsFilter(model),
    },
    nEpns: {
        name: 'EPNs #',
        visible: false,
        size: 'cell-s f6 w-wrapped',
    },
    nSubtimeframes: {
        name: '# of STFs',
        visible: false,
        size: 'cell-s f6 w-wrapped',
    },
    bytesReadOut: {
        name: 'Readout Data',
        visible: false,
        size: 'cell-m f6 w-wrapped',
    },
    dd_flp: {
        name: 'Data Distribution (FLP)',
        visible: true,
        size: 'w-2 f6 w-wrapped',
        format: (boolean) => boolean ? 'On' : 'Off',
        filter: ddflpFilter(model),
    },
    dcs: {
        name: 'DCS',
        visible: true,
        size: 'w-2 f6 w-wrapped',
        format: (boolean) => boolean ? 'On' : 'Off',
        filter: dcsFilter(model),
    },
    epn: {
        name: 'EPN',
        visible: true,
        size: 'w-2 f6 w-wrapped',
        format: (boolean) => boolean ? 'On' : 'Off',
        filter: epnFilter(model),
    },
    epnTopology: {
        name: 'EPN Topology',
        visible: true,
        size: 'w-20 f6 w-wrapped',
        filter: epnTopologyFilter(model),
    },
    actions: {
        name: '',
        visible: true,
        size: 'w-5 f6 w-wrapped',
        format: (_, run) => h('.flex-row', {
            style: 'justify-content: end',
        }, h(`button#btn${run.id}.btn.btn-primary.btn-sm.btn-redirect`, {
            onclick: () => model.router.go(`?page=run-detail&id=${run.id}`),
        }, 'More')),
    },
});

/**
 * Method to retrieve the list of active home overview columns for a generic table component
 * @param {Object} model The global model object
 * @return {Object} A collection of columns with parameters for the Run table
 */
export const activeHomeOverviewColumns = (model) => ({
    runNumber: {
        name: 'Number',
        visible: true,
        size: 'w-20',
    },
    timeO2Start: {
        name: 'O2 Start',
        visible: true,
        size: 'w-30',
        format: (date) =>
            date ? new Date(date).toLocaleString('en-GB', { timeStyle: 'medium', dateStyle: 'medium' }) : '-',
    },
    timeO2End: {
        name: 'O2 Stop',
        visible: true,
        size: 'w-30',
        format: (date) =>
            date ? new Date(date).toLocaleString('en-GB', { timeStyle: 'medium', dateStyle: 'medium' }) : '-',
    },
    actions: {
        name: '',
        visible: true,
        size: 'w-15',
        format: (_, run) => h('.flex-row', {
            style: 'justify-content: end',
        }, h(`button#btn${run.id}.btn.btn-primary.btn-sm.btn-redirect`, {
            onclick: () => model.router.go(`?page=run-detail&id=${run.id}`),
        }, 'More')),
    },
});

export default activeColumns;
