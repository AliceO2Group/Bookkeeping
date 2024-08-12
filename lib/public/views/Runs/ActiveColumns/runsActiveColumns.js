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
import { displayRunEorReasonsOverview } from '../format/displayRunEorReasonOverview.js';
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
import { triggerValueFilter } from '../../../components/Filters/RunsFilter/triggerValueFilter.js';
import lhcPeriodsFilter from '../../../components/Filters/RunsFilter/lhcPeriod.js';
import { formatRunType } from '../../../utilities/formatting/formatRunType.js';
import definitionFilter from '../../../components/Filters/RunsFilter/definitionFilter.js';
import { profiles } from '../../../components/common/table/profiles.js';
import { formatDuration } from '../../../utilities/formatting/formatDuration.mjs';
import { formatRunStart } from '../format/formatRunStart.js';
import { formatRunEnd } from '../format/formatRunEnd.js';
import { tagFilter } from '../../../components/Filters/common/filters/tagFilter.js';
import { formatRunDuration } from '../../../utilities/formatting/formatRunDuration.mjs';
import { selectionDropdown } from '../../../components/common/selection/dropdown/selectionDropdown.js';
import { eorReasonFilter } from '../../../components/Filters/RunsFilter/eorReasonFilter.js';
import { RunDefinition } from '../../../domain/enums/RunDefinition.js';
import { coloredCalibrationStatusComponent } from '../coloredCalibrationStatusComponent.js';
import { BeamModes } from '../../../domain/enums/BeamModes.js';
import { formatRunDetectorsInline } from '../format/formatRunDetectorsInline.js';
import { formatAliceCurrent } from '../format/formatAliceCurrent.js';
import { formatTagsList } from '../../Tags/format/formatTagsList.js';
import { buttonLinkWithDropdown } from '../../../components/common/selection/infoLoggerButtonGroup/buttonLinkWithDropdown.js';
import { CopyToClipboardComponent } from '../../../components/common/selection/infoLoggerButtonGroup/CopyToClipboardComponent.js';
import { infologgerLinksComponents } from '../../../components/common/externalLinks/infologgerLinksComponents.js';
import { RunQualities } from '../../../domain/enums/RunQualities.js';
import { qcGuiLinkComponent } from '../../../components/common/externalLinks/qcGuiLinkComponent.js';
import { isRunConsideredRunning } from '../../../services/run/isRunConsideredRunning.js';
import { aliEcsEnvironmentLinkComponent } from '../../../components/common/externalLinks/aliEcsEnvironmentLinkComponent.js';

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
        classes: 'w-10 f6 w-wrapped',
        sortable: true,
        filter: runNumberFilter,
        format: (runNumber, run) => buttonLinkWithDropdown(
            runNumber,
            'run-detail',
            { runNumber },
            [
                h(
                    CopyToClipboardComponent,
                    {
                        value: runNumber,
                        id: runNumber,
                    },
                    'Copy Run Number',
                ),
                ...infologgerLinksComponents({ runNumbers: [runNumber] }),
                qcGuiLinkComponent(run),
                isRunConsideredRunning(run)
                    ? aliEcsEnvironmentLinkComponent(run.environmentId)
                    : null,
            ],
        ),
        profiles: {
            home: true,
            lhcFill: true,
            environment: true,
            runsPerLhcPeriod: {
                classes: 'w-7 f6 w-wrapped',
            },
            runsPerDataPass: {
                classes: 'w-7 f6 w-wrapped',
            },
            runsPerSimulationPass: {
                classes: 'w-7 f6 w-wrapped',
            },
            rcTemplate: true,
        },
    },
    detectors: {
        name: 'Detectors',
        visible: true,
        profiles: {
            [profiles.none]: null,
            lhcFill: null,
            home: null,
            runsPerDataPass: { visible: false },
        },
        size: 'w-15 f6',
        format: (_, run) => formatRunDetectorsInline(run.detectorsQualities, run.nDetectors),
        filter: detectorsFilterComponent,
        balloon: true,
    },
    tags: {
        name: 'Tags',
        visible: true,
        profiles: {
            [profiles.none]: null,
            lhcFill: null,
            environment: null,
            runsPerDataPass: { visible: false },
        },
        classes: 'w-5 f6',
        format: (tags) => formatTagsList(tags),
        exportFormat: (tags) => tags?.length ? tags.map(({ text }) => text).join('-') : '-',
        filter: (runModel) => tagFilter(runModel.listingTagsFilterModel),
        balloon: (tags) => tags && tags.length > 0,
    },
    fillNumber: {
        name: 'Fill No.',
        visible: true,
        profiles: {
            lhcFill: true,
            environment: true,
            runsPerLhcPeriod: {
                classes: 'w-2 f6',
            },
            runsPerDataPass: {
                classes: 'w-2 f6',
            },
            runsPerSimulationPass: {
                classes: 'w-2 f6',
            },
            rcTemplate: true,
        },
        classes: 'w-5 f6',
        format: (fill, run) => fill !== null && run.lhcBeamMode === BeamModes.STABLE_BEAMS
            ? frontLink(fill, 'lhc-fill-details', { fillNumber: fill }) : '-',
        filter: fillNumbersFilter,
    },
    lhcPeriod: {
        name: 'LHC Period',
        visible: true,
        profiles: [profiles.none, 'lhcFill', 'environment', 'home'],
        classes: 'w-5 f6',
        format: (lhcPeriod, run) => lhcPeriod && run.lhcBeamMode === BeamModes.STABLE_BEAMS ? lhcPeriod : '-',
        filter: lhcPeriodsFilter,
    },
    timeO2Start: {
        name: 'Start',
        visible: true,
        classes: 'w-7 f6',
        noEllipsis: true,
        format: (_, run) => formatRunStart(run, false),
        exportFormat: (timestamp) => formatTimestamp(timestamp),
        filter: o2startFilter,
        profiles: {
            lhcFill: true,
            environment: true,
            home: {
                classes: 'w-10 f6',
                format: (_, run) => formatRunStart(run, true),
            },
            runsPerLhcPeriod: {
                classes: 'f6 w-wrapped',
            },
            runsPerDataPass: {
                classes: 'f6 w-wrapped',
            },
            runsPerSimulationPass: {
                classes: 'f6 w-wrapped',
            },
        },
    },
    timeO2End: {
        name: 'Stop',
        visible: true,
        classes: 'w-7 f6',
        noEllipsis: true,
        format: (_, run) => formatRunEnd(run, false),
        exportFormat: (timestamp) => formatTimestamp(timestamp),
        filter: o2endFilter,
        profiles: {
            lhcFill: true,
            environment: true,
            home: {
                classes: 'w-10 f6',
                format: (_, run) => formatRunEnd(run, true),
            },
            runsPerLhcPeriod: {
                classes: 'f6 w-wrapped',
            },
            runsPerDataPass: {
                classes: 'f6 w-wrapped',
            },
            runsPerSimulationPass: {
                classes: 'f6 w-wrapped',
            },
        },
    },
    timeTrgStart: {
        name: 'TRG Start',
        visible: false,
        classes: 'w-10 f6 w-wrapped',
        format: (timestamp) => formatTimestamp(timestamp, false),
        exportFormat: (timestamp) => formatTimestamp(timestamp),
        profiles: {
            runsPerLhcPeriod: {
                visible: true,
                classes: 'f6 w-wrapped',
            },
            runsPerDataPass: {
                visible: true,
                classes: 'f6 w-wrapped',
            },
            runsPerSimulationPass: {
                visible: true,
                classes: 'f6 w-wrapped',
            },
        },
    },
    timeTrgEnd: {
        name: 'TRG Stop',
        visible: false,
        classes: 'w-10 f6 w-wrapped',
        format: (timestamp) => formatTimestamp(timestamp, false),
        exportFormat: (timestamp) => formatTimestamp(timestamp),
        profiles: {
            runsPerLhcPeriod: {
                visible: true,
                classes: 'f6 w-wrapped',
            },
            runsPerDataPass: {
                visible: true,
                classes: 'f6 w-wrapped',
            },
            runsPerSimulationPass: {
                visible: true,
                classes: 'f6 w-wrapped',
            },
        },
    },
    timeSincePreviousRun: {
        name: 'Since prev.',
        visible: true,
        profiles: ['lhcFill'],
        classes: 'f6 w-10',
        format: (duration) => duration !== null
            ? formatDuration(duration)
            : h('strong.danger', 'UNKNOWN'),
    },
    definition: {
        name: 'Definition',
        visible: true,
        profiles: {
            lhcFill: true,
            environment: true,
            home: {
                classes: 'f6 w-15',
                format: (definition, run) => h(
                    '.flex-row.g2',
                    [definition, definition === RunDefinition.Calibration && coloredCalibrationStatusComponent(run.calibrationStatus)],
                ),
            },
        },
        classes: 'w-10 f6 w-wrapped',
        format: (definition, run) => {
            const lines = [h('', definition || '-')];
            if (definition === RunDefinition.Calibration) {
                lines.push(coloredCalibrationStatusComponent(run.calibrationStatus));
            }
            return h('.flex-column.items-start', lines);
        },
        filter: definitionFilter,
    },
    runDuration: {
        name: 'Duration',
        visible: true,
        classes: 'w-7 f6',
        profiles: {
            [profiles.none]: null,
            lhcFill: null,
            environment: null,
            home: null,
            runsPerDataPass: { visible: false },
        },
        noEllipsis: true,
        format: (_duration, run) => displayRunDuration(run),
        exportFormat: (_duration, run) => formatRunDuration(run),
        filter: durationFilter,
        filterTooltip: 'Run duration (in minutes)',
    },
    environmentId: {
        name: 'Environment ID',
        visible: true,
        profiles: [profiles.none, 'lhcFill', 'environment', 'home'],
        classes: 'w-10 f6 w-wrapped',
        filter: environmentIdFilter,
        format: (id) => id ? frontLink(id, 'env-details', { environmentId: id }) : '-',
    },
    runType: {
        name: 'Run Type',
        visible: false,
        classes: 'cell-l f6 w-wrapped',
        format: formatRunType,
        filter: (runModel) => selectionDropdown(runModel.listingRunTypesFilterModel, { selectorPrefix: 'run-types' }),
    },
    runQuality: {
        name: 'Quality',
        visible: true,
        classes: 'w-5 f6 w-wrapped',
        profiles: {
            [profiles.none]: true,
            lhcFill: true,
            environment: true,
            rcTemplate: {
                classes: '',
                format: (runQuality) => h('.btn.white', {
                    class: (() => {
                        if (runQuality === RunQualities.GOOD) {
                            return 'bg-success';
                        } else if (runQuality === RunQualities.BAD) {
                            return 'bg-danger';
                        }
                        return 'bg-gray-darker';
                    })(),
                }, runQuality),
            },
        },
        filter: runQualityFilter,
    },
    nDetectors: {
        name: 'DETs #',
        visible: false,
        classes: 'w-2 f6 w-wrapped',
        filter: nDetectorsFilter,
    },
    nEpns: {
        name: 'EPNs #',
        visible: true,
        profiles: [profiles.none, 'lhcFill', 'environment'],
        classes: 'w-2 f6 w-wrapped',
        // eslint-disable-next-line no-extra-parens
        format: (nEpns, run) => run.epn ? (typeof nEpns === 'number' ? nEpns : 'ON') : 'OFF',
        filter: nEpnsFilter,
    },
    nFlps: {
        name: 'FLPs #',
        visible: true,
        profiles: [profiles.none, 'lhcFill', 'environment'],
        classes: 'w-2 f6 w-wrapped',
        filter: nFlpsFilter,
    },
    nSubtimeframes: {
        name: '# of STFs',
        visible: false,
        classes: 'cell-s f6 w-wrapped',
    },
    bytesReadOut: {
        name: 'Readout Data',
        visible: false,
        classes: 'cell-m f6 w-wrapped',
    },
    dd_flp: {
        name: 'Data Distribution (FLP)',
        visible: false,
        profiles: [profiles.none, 'lhcFill', 'environment'],
        classes: 'w-2 f6 w-wrapped',
        format: (boolean) => boolean ? 'On' : 'Off',
        exportFormat: (boolean) => boolean ? 'On' : 'Off',
        filter: ddflpFilter,
    },
    dcs: {
        name: 'DCS',
        visible: true,
        profiles: [profiles.none, 'lhcFill', 'environment'],
        classes: 'w-2 f6 w-wrapped',
        format: (boolean) => boolean ? 'On' : 'Off',
        exportFormat: (boolean) => boolean ? 'On' : 'Off',
        filter: dcsFilter,
    },
    triggerValue: {
        name: 'TRG',
        visible: true,
        profiles: [profiles.none, 'lhcFill', 'environment'],
        classes: 'w-5 f6 w-wrapped',
        filter: triggerValueFilter,
        format: (trgValue) => trgValue ? trgValue : '-',
    },
    epn: {
        name: 'EPN',
        visible: false,
        profiles: [profiles.none, 'lhcFill', 'environment'],
        classes: 'w-2 f6 w-wrapped',
        format: (boolean) => boolean ? 'On' : 'Off',
        exportFormat: (boolean) => boolean ? 'On' : 'Off',
        filter: epnFilter,
    },
    epnTopology: {
        name: 'EPN Topology',
        visible: false,
        classes: 'w-10 f6',
        balloon: true,
    },
    odcTopologyFullName: {
        name: 'Topology Full',
        classes: 'w-15 f6',
        visible: false,
        profiles: [profiles.none, 'lhcFill', 'environment'],
        filter: odcTopologyFullName,
        balloon: true,
    },
    eorReasons: {
        name: 'EOR Reason',
        classes: 'w-15 f6',
        visible: true,
        profiles: [profiles.none, 'lhcFill', 'environment'],
        format: (eorReasons) => displayRunEorReasonsOverview(eorReasons),
        filter: eorReasonFilter,
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
        exportFormat: formatTimestamp,
    },
    endOfDataTransfer: {
        name: 'End of Data Transfer',
        visible: false,
        exportFormat: formatTimestamp,
    },
    ctfFileCount: {
        name: 'CTF File Count',
        visible: false,
    },
    ctfFileSize: {
        name: 'CTF File Size',
        visible: false,
    },
    tfFileCount: {
        name: 'TF File Count',
        visible: false,
    },
    tfFileSize: {
        name: 'TF File Size',
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
    aliceL3Current: {
        name: 'L3 (A)',
        visible: true,
        format: (_, run) => formatAliceCurrent(run.aliceL3Polarity, run.aliceL3Current),
        profiles: ['runsPerLhcPeriod', 'runsPerDataPass', 'runsPerSimulationPass'],
    },
    dipoleCurrent: {
        name: 'Dipole (A)',
        visible: true,
        format: (_, run) => formatAliceCurrent(run.aliceDipolePolarity, run.aliceDipoleCurrent),
        profiles: ['runsPerLhcPeriod', 'runsPerDataPass', 'runsPerSimulationPass'],
    },
    aliceL3AndDipoleCurrent: {
        name: 'L3 / Dipole',
        visible: false,
        filter: ({ aliceL3AndDipoleCurrentFilter }) => selectionDropdown(aliceL3AndDipoleCurrentFilter, { selectorPrefix: 'l3-dipole-current' }),
        profiles: ['runsPerLhcPeriod', 'runsPerDataPass', 'runsPerSimulationPass'],
    },
};
