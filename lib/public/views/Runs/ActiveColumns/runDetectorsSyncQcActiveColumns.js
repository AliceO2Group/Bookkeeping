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
import { getQcSummaryDisplay } from './getQcSummaryDisplay.js';

/**
 * Factory for detectors related active columns configuration
 * @param {Detector[]|DplDetector[]} detectors detectors list
 * @param {object} [options] additional options
 * @param {object|string|string[]} [options.profiles] profiles to which the column is restricted to
 * @return {object} active columns configuration
 */
export const runDetectorsSyncQcActiveColumns = (
    detectors,
    { profiles, qcSummary } = {},
) => Object.fromEntries(detectors?.map(({ name: detectorName, id: detectorId }) => [
    detectorName, {
        name: detectorName.toUpperCase(),
        visible: true,
        format: (_, run) => {
            const runDetectorSummary = qcSummary?.[run.runNumber]?.[detectorId];
            return runDetectorSummary
                ? getQcSummaryDisplay({ ...runDetectorSummary, missingVerificationsCount: 0 }) // Ignore verifications
                : h('m2.badge.gray', iconBan());
        },
        profiles,
    },
]) ?? []);
