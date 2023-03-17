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
import o2startFilter from '../../../components/Filters/RunsFilter/o2start.js';
import o2endFilter from '../../../components/Filters/RunsFilter/o2stop.js';
import environmentIdFilter from '../../../components/Filters/RunsFilter/environmentId.js';
import nDetectorsFilter from '../../../components/Filters/RunsFilter/nDetectors.js';
import nFlpsFilter from '../../../components/Filters/RunsFilter/nFlps.js';
import odcTopologyFullName from '../../../components/Filters/RunsFilter/odcTopologyFullName.js';
import { detectorsFilterComponent } from '../../../components/Filters/RunsFilter/detectorsFilterComponent.js';
import ddflpFilter from '../../../components/Filters/RunsFilter/ddflp.js';
import dcsFilter from '../../../components/Filters/RunsFilter/dcs.js';
import epnFilter from '../../../components/Filters/RunsFilter/epn.js';
import runQualityFilter from '../../../components/Filters/RunsFilter/runQuality.js';
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';
import { durationFilter } from '../../../components/Filters/RunsFilter/durationFilter.js';
import { displayRunDuration } from '../format/displayRunDuration.js';
import fillNumbersFilter from '../../../components/Filters/RunsFilter/fillNumbers.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import nEpnsFilter from '../../../components/Filters/RunsFilter/nEpns.js';
import triggerValueFilter from '../../../components/Filters/RunsFilter/triggerValue.js';
import lhcPeriodsFilter from '../../../components/Filters/RunsFilter/lhcPeriod.js';
import { formatRunType } from '../../../utilities/formatting/formatRunType.js';
import runTypeFilter from '../../../components/Filters/RunsFilter/runTypeFilter.js';
import definitionFilter from '../../../components/Filters/RunsFilter/definitionFilter.js';
import { profiles } from '../../../components/common/table/profiles.js';
import { formatDuration } from '../../../utilities/formatting/formatDuration.js';
import { formatRunStart } from '../format/formatRunStart.js';
import { formatRunEnd } from '../format/formatRunEnd.js';
import { tagFilter } from '../../../components/Filters/common/filters/tagFilter.js';

/**
 * List of active columns for a generic runs table
 */
export const runsActiveColumns = {
    id: {
        name: 'ID',
        visible: false,
        primary: true,
    },
    runNumber: {
        name: 'Run',
        visible: true,
        size: 'w-5 f6 w-wrapped',
        filter: runNumberFilter,
        format: (text, run) => frontLink(text, 'run-detail', { id: run.id }),
        profiles: {
            lhcFill: true,
            environment: true,
            home: {
                name: 'Number',
                format: null,
                size: 'w-20',
            },
        },
    },
    detectors: {
        name: 'Detectors',
        visible: true,
        profiles: [profiles.none, 'lhcFill'],
        size: 'w-15 f6',
        format: (detectors, run) => {
            if (detectors && detectors.length > 0) {
                return [h('.badge.bg-gray-light.mh2.nDetectors-badge', run.nDetectors), `${detectors.toString()}`];
            }
            return '-';
        },
        filter: detectorsFilterComponent,
        balloon: true,
    },
    tags: {
        name: 'Tags',
        visible: true,
        profiles: [profiles.none, 'lhcFill', 'environment'],
        size: 'w-15 f6',
        format: (tags) => tags && tags.length > 0 ? tags.map(({ text }) => text).join(', ') : '-',
        exportFormat: (tags) => tags && tags.length > 0 ? tags.map(({ text }) => text).join(', ') : '-',
        filter: (runModel) => tagFilter(runModel.listingTagsFilterModel),
        balloon: (tags) => tags && tags.length > 0,
    },
    fillNumber: {
        name: 'Fill No.',
        visible: true,
        profiles: [profiles.none, 'lhcFill', 'environment'],
        size: 'w-5 f6',
        format: (fill) => fill !== null ? frontLink(fill, 'lhc-fill-details', { fillNumber: fill }) : '-',
        filter: fillNumbersFilter,
    },
    lhcPeriod: {
        name: 'LHC Period',
        visible: true,
        profiles: [profiles.none, 'lhcFill', 'environment'],
        size: 'w-5 f6',
        format: (lhcPeriod) => lhcPeriod ? lhcPeriod : '-',
        filter: lhcPeriodsFilter,
    },
    timeO2Start: {
        name: 'Start',
        visible: true,
        size: 'w-7 f6',
        noEllipsis: true,
        format: (timestamp, run) => formatRunStart(run, false),
        exportFormat: (timestamp) => formatTimestamp(timestamp),
        filter: o2startFilter,
        profiles: {
            lhcFill: true,
            environment: true,
            home: {
                name: 'Start',
                size: 'w-30',
                format: (timestamp, run) => formatRunStart(run, true),
            },
        },
    },
    timeO2End: {
        name: 'Stop',
        visible: true,
        size: 'w-7 f6',
        noEllipsis: true,
        format: (timestamp, run) => formatRunEnd(run, false),
        exportFormat: (timestamp) => formatTimestamp(timestamp),
        filter: o2endFilter,
        profiles: {
            lhcFill: true,
            environment: true,
            home: {
                name: 'Stop',
                size: 'w-30',
                format: (timestamp, run) => formatRunEnd(run, true),

            },
        },
    },
    timeTrgStart: {
        name: 'TRG Start',
        visible: false,
        size: 'w-10 f6 w-wrapped',
        format: (timestamp) => formatTimestamp(timestamp, false),
        exportFormat: (timestamp) => formatTimestamp(timestamp),
    },
    timeTrgEnd: {
        name: 'TRG Stop',
        visible: false,
        size: 'w-10 f6 w-wrapped',
        format: (timestamp) => formatTimestamp(timestamp, false),
        exportFormat: (timestamp) => formatTimestamp(timestamp),
    },
    timeSincePreviousRun: {
        name: 'Since prev.',
        visible: true,
        profiles: ['lhcFill'],
        size: 'f6 w-10',
        format: (duration) => duration !== null
            ? formatDuration(duration)
            : h('strong.danger', 'UNKNOWN'),
    },
    triggerValue: {
        name: 'Trg Value',
        visible: true,
        profiles: [profiles.none, 'lhcFill', 'environment'],
        size: 'w-5 f6 w-wrapped',
        filter: triggerValueFilter,
        format: (trgValue) => trgValue ? trgValue : '-',
    },
    definition: {
        name: 'Definition',
        visible: true,
        profiles: [profiles.none, 'lhcFill', 'environment'],
        size: 'w-5 f6 w-wrapped',
        format: (definition) => definition || '-',
        filter: definitionFilter,
    },
    runDuration: {
        name: 'Duration',
        visible: true,
        size: 'w-7 f6',
        profiles: [profiles.none, 'lhcFill', 'environment'],
        noEllipsis: true,
        format: (_duration, run) => displayRunDuration(run),
        exportFormat: (_duration, run) => displayRunDuration(run, true),
        filter: durationFilter,
    },
    environmentId: {
        name: 'Environment ID',
        visible: true,
        profiles: [profiles.none, 'lhcFill', 'environment'],
        size: 'w-10 f6 w-wrapped',
        filter: environmentIdFilter,
        format: (id) => id ? frontLink(id, 'env-details', { environmentId: id }) : '-',
    },
    runType: {
        name: 'Run Type',
        visible: false,
        size: 'cell-l f6 w-wrapped',
        format: formatRunType,
        filter: (runModel, model) => runTypeFilter(model.runTypes, runModel.listingRunTypesFilterModel),
    },
    runQuality: {
        name: 'Quality',
        visible: true,
        profiles: [profiles.none, 'lhcFill', 'environment'],
        size: 'w-5 f6 w-wrapped',
        filter: runQualityFilter,
    },
    nDetectors: {
        name: 'DETs #',
        visible: false,
        size: 'w-2 f6 w-wrapped',
        filter: nDetectorsFilter,
    },
    nEpns: {
        name: 'EPNs #',
        visible: true,
        profiles: [profiles.none, 'lhcFill', 'environment'],
        size: 'w-2 f6 w-wrapped',
        format: (nEpn) => nEpn ? nEpn : '-',
        filter: nEpnsFilter,
    },
    nFlps: {
        name: 'FLPs #',
        visible: true,
        profiles: [profiles.none, 'lhcFill', 'environment'],
        size: 'w-2 f6 w-wrapped',
        filter: nFlpsFilter,
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
        profiles: [profiles.none, 'lhcFill', 'environment'],
        size: 'w-2 f6 w-wrapped',
        format: (boolean) => boolean ? 'On' : 'Off',
        exportFormat: (boolean) => boolean ? 'On' : 'Off',
        filter: ddflpFilter,
    },
    dcs: {
        name: 'DCS',
        visible: true,
        profiles: [profiles.none, 'lhcFill', 'environment'],
        size: 'w-2 f6 w-wrapped',
        format: (boolean) => boolean ? 'On' : 'Off',
        exportFormat: (boolean) => boolean ? 'On' : 'Off',
        filter: dcsFilter,
    },
    epn: {
        name: 'EPN',
        visible: true,
        profiles: [profiles.none, 'lhcFill', 'environment'],
        size: 'w-2 f6 w-wrapped',
        format: (boolean) => boolean ? 'On' : 'Off',
        exportFormat: (boolean) => boolean ? 'On' : 'Off',
        filter: epnFilter,
    },
    epnTopology: {
        name: 'EPN Topology',
        visible: false,
        size: 'w-15 f6',
        balloon: true,
    },
    odcTopologyFullName: {
        name: 'Topology Full',
        size: 'w-15 f6',
        visible: true,
        profiles: [profiles.none, 'lhcFill', 'environment'],
        filter: odcTopologyFullName,
        balloon: true,
    },
    pdpWorkflowParameters: {
        name: 'PDP Workflow Parameters',
        visible: false,
    },
    pdpBeamType: {
        name: 'PDP Beam Type',
        visible: false,
    },
    readoutCfgUri: {
        name: 'Readout Config URI',
        visible: false,
    },
    startOfDataTransfer: {
        name: 'Start of Data Transfer',
        visible: false,
        formatTimestamp: (timestamp) => formatTimestamp(timestamp, false),
        exportFormat: formatTimestamp,
    },
    endOfDataTransfer: {
        name: 'End of Data Transfer',
        visible: false,
        formatTimestamp: (timestamp) => formatTimestamp(timestamp, false),
        exportFormat: formatTimestamp,
    },
    ctfFileCount: {
        name: 'Ctf File Count',
        visible: false,
    },
    ctfFileSize: {
        name: 'Ctf File Size',
        visible: false,
    },
    tfFileCount: {
        name: 'Tf File Count',
        visible: false,
    },
    tfFileSize: {
        name: 'Tf File Size',
        visible: false,
    },
    otherFileCount: {
        name: 'Other File Count',
        visible: false,
    },
    otherFileSize: {
        name: 'Other File Size',
        visible: false,
    },
    actions: {
        name: '',
        visible: true,
        profiles: 'home',
        size: 'w-15',
        format: (_, run) => h(
            '.flex-row',
            { style: 'justify-content: end' },
            frontLink(
                'More',
                'run-detail',
                { id: run.id },
                { id: `btn${run.id}`, class: 'btn btn-primary btn-sm btn-redirect' },
            ),
        ),
    },
};
