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

import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';
import { h } from '/js/src/index.js';
import { displayRunDuration } from '../format/displayRunDuration.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { formatRunType } from '../../../utilities/formatting/formatRunType.js';
import { formatBoolean } from '../../../utilities/formatting/formatBoolean.js';
import { editRunEorReasons } from '../format/editRunEorReasons.js';
import { formatRunQuality } from '../format/formatRunQuality.js';
import { formatRunDetectors } from '../format/formatRunDetectors.js';
import { displayRunEorReasons } from '../format/displayRunEorReasons.js';
import { formatFileSize } from '../../../utilities/formatting/formatFileSize.js';
import { formatRunCalibrationStatus } from '../format/formatRunCalibrationStatus.js';
import { formatTagListColor } from '../../Tags/format/formatTagListColor.js';

/**
 * Returns the configuration to display a given run
 *
 * @param {RunDetailsModel} runDetailsModel the model storing the run details state
 * @return {Object} A collection of data with parameters for the Run detail page.
 */
export const runDetailsConfiguration = (runDetailsModel) => ({
    detectors: {
        name: 'Detectors',
        visible: true,
        format: (_, run) => formatRunDetectors(run, runDetailsModel),
    },
    tags: {
        name: 'Tags',
        visible: true,
        format: (tags) => tags && tags.length > 0 ? formatTagListColor(tags) : '-',
    },
    timeO2Start: {
        name: 'O2 Start',
        visible: true,
        format: (timestamp) => formatTimestamp(timestamp),
    },
    timeO2End: {
        name: 'O2 Stop',
        visible: true,
        format: (timestamp) => formatTimestamp(timestamp),
    },
    timeTrgStart: {
        name: 'TRG Start',
        visible: true,
        format: (timestamp) => formatTimestamp(timestamp),
    },
    timeTrgEnd: {
        name: 'TRG Stop',
        visible: true,
        format: (timestamp) => formatTimestamp(timestamp),
    },
    runDuration: {
        name: 'Run Duration',
        visible: true,
        format: (_duration, run) =>
            h('#runDurationValue', displayRunDuration(run)),
    },
    environmentId: {
        name: 'Environment Id',
        visible: true,
        format: (id) => id ? frontLink(id, 'env-details', { environmentId: id }) : '-',
    },
    runQuality: {
        name: 'Run Quality',
        visible: true,
        format: (runQuality, run) => formatRunQuality(runDetailsModel, runQuality, run),
    },
    definition: {
        name: 'Definition',
        visible: true,
        format: (definition) => definition || '-',
    },
    calibrationStatus: {
        name: 'Calibration status',
        visible: (calibrationStatus) => calibrationStatus !== null,
        format: (calibrationStatus, run) => formatRunCalibrationStatus(runDetailsModel, run),
    },
    runType: {
        name: 'Run Type',
        visible: true,
        format: formatRunType,
    },
    nDetectors: {
        name: 'Number of Detectors',
        visible: true,
    },
    nEpns: {
        name: 'Number of EPNs',
        visible: true,
        // eslint-disable-next-line no-extra-parens
        format: (nEpns, { epn }) => epn ? (typeof nEpns === 'number' ? nEpns : 'ON') : 'OFF',
    },
    nFlps: {
        name: 'Number of FLPs',
        visible: true,
    },
    triggerValue: {
        name: 'Trigger Value',
        visible: true,
    },
    pdpConfigOption: {
        name: 'PDP Configuration Option',
        visible: true,
    },
    pdpTopologyDescriptionLibraryFile: {
        name: 'PDP Topology Description Library File',
    },
    pdpWorkflowParameters: {
        name: 'PDP Workflow Parameters',
        visible: true,
    },
    pdpBeamType: {
        name: 'PDP Beam Type',
        visible: true,
    },
    tfbDdMode: {
        name: 'TFB DD Mode',
        visible: true,
    },
    dd_flp: {
        name: 'Data Distribution (FLP)',
        visible: true,
        format: formatBoolean,
    },
    dcs: {
        name: 'DCS',
        visible: true,
        format: formatBoolean,
    },
    epnTopology: {
        name: 'Topology',
        visible: true,
    },
    odcTopologyFullName: {
        name: 'Topology Full Name',
        visible: true,
    },
    readoutCfgUri: {
        name: 'Readout Config URI',
        visible: true,
    },
    startOfDataTransfer: {
        name: 'Start of Data Transfer',
        visible: true,
        format: formatTimestamp,

    },
    endOfDataTransfer: {
        name: 'End of Data Transfer',
        visible: true,
        format: formatTimestamp,

    },
    ctfFileCount: {
        name: 'Ctf File Count',
        visible: true,
    },
    ctfFileSize: {
        name: 'Ctf File Size',
        visible: true,
        format: formatFileSize,
    },
    tfFileCount: {
        name: 'Tf File Count',
        visible: true,
    },
    tfFileSize: {
        name: 'Tf File Size',
        visible: true,
        format: formatFileSize,
    },
    otherFileCount: {
        name: 'Other File Count',
        visible: true,
    },
    otherFileSize: {
        name: 'Other File Size',
        visible: false,
        format: formatFileSize,
    },
    eorReasons: {
        name: 'EOR Reasons',
        visible: true,
        format: (eorReasons) => runDetailsModel.isEditModeEnabled
            ? editRunEorReasons(runDetailsModel)
            : displayRunEorReasons(eorReasons),
    },
});
