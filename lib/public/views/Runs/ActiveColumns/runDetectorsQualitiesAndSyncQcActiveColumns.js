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
import { h, iconBan } from '/js/src/index.js';
import { formatDetectorQuality } from '../format/formatDetectorQuality.js';
import { getQcSummaryDisplay } from './getQcSummaryDisplay.js';
import { qcFlagOverviewPanelLink } from '../../../components/qcFlags/qcFlagOverviewPanelLink.js';
import { DetectorType } from '../../../domain/enums/DetectorTypes.js';

/**
 * Factory for detectors related active columns configuration displaying, in a single column per detector, both the detector's
 * online quality and its synchronous QC flags summary, one under the other
 *
 * @param {Detector[]} detectors detectors list
 * @param {object} [options] additional options
 * @param {object|string|string[]} [options.profiles] profiles to which the column is restricted to
 * @param {QcSummary} [options.qcSummary] QC summary of synchronous QC flags for given LHC period
 * @return {object} active columns configuration
 */
export const runDetectorsQualitiesAndSyncQcActiveColumns = (
    detectors,
    { profiles, qcSummary } = {},
) => Object.fromEntries(detectors?.map(({ name: detectorName, id: detectorId, type: detectorType }) => [
    detectorName, {
        name: detectorName.toUpperCase(),
        visible: true,
        format: (_, { runNumber, detectorsQualities }) => {
            const detectorWasActiveDuringRun = detectorsQualities.find(({ name }) => name === detectorName);

            const qualityDisplay = detectorWasActiveDuringRun
                ? formatDetectorQuality(detectorWasActiveDuringRun.quality)
                : null;

            let syncQcDisplay = null;
            if (!(detectorType === DetectorType.PHYSICAL && !detectorWasActiveDuringRun)) {
                const runDetectorSummary = qcSummary?.[runNumber]?.[detectorId];
                syncQcDisplay = runDetectorSummary
                    ? qcFlagOverviewPanelLink(
                        getQcSummaryDisplay({ ...runDetectorSummary, missingVerificationsCount: 0 }), // Ignore verifications
                        { runNumber, dplDetectorId: detectorId },
                    )
                    : h('m2.badge.gray', iconBan());
            }

            return qualityDisplay || syncQcDisplay ? h('.flex-column.g1', [qualityDisplay, syncQcDisplay]) : null;
        },
        profiles,
    },
]) ?? []);
