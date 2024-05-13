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
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { formatFloat } from '../../../utilities/formatting/formatFloat.js';
import { isContrastBlack } from '../../../components/common/badge.js';
import { ChartColors } from '../../Statistics/chartColors.js';

/**
 * Render QC summary for given run and detector
 * @param {number} runNumber run number
 * @param {number} dplDetectorId id of the detector
 * @param {QcSummary} qcSummary QC summary
 * @return {Component} component
 */
const runDetectorAsyncQualityDisplay = (runNumber, dplDetectorId, qcSummary) => {
    if (!qcSummary?.[runNumber]?.[dplDetectorId]) {
        return h('.btn.white.bg-primary', 'QC');
    }

    const {
        badEffectiveRunCoverage = null,
        explicitlyNotBadEffectiveRunCoverage = null,
        missingVerificationsCount = 0,
    } = qcSummary[runNumber][dplDetectorId];

    const notBadPercentageFormat = [
        formatFloat((1 - badEffectiveRunCoverage) * 100, { precision: 0 }),
        missingVerificationsCount ? h('sub', '!') : null,
    ];

    /**
     * Format QC summary with colour
     * @param {*} content content
     * @param {string} [configuration.color] background colour
     * @returns {Component} QC summary display
     */
    const getDisplayForColor = (content, { color }) => h(
        'span.btn.w-100',
        { style: {
            backgroundColor: color,
            color: isContrastBlack(color) ? 'black' : 'white',
        } },
        content,
    );

    if (!badEffectiveRunCoverage) {
        if (explicitlyNotBadEffectiveRunCoverage === 1) {
            return getDisplayForColor(notBadPercentageFormat, { color: ChartColors.Green.dark });
        } else {
            return getDisplayForColor(notBadPercentageFormat, { color: ChartColors.Gray.dark });
        }
    } else {
        if (badEffectiveRunCoverage === 1) {
            return getDisplayForColor(notBadPercentageFormat, { color: ChartColors.Red.dark });
        } else {
            return getDisplayForColor(notBadPercentageFormat, { color: ChartColors.Orange.dark });
        }
    }
};

/**
 * Factory for detectors related active columns configuration
 * @param {DplDetector[]} dplDetectors detectors list
 * @param {object} [options] additional options
 * @param {object|string|string[]} [options.profiles] profiles to which the column is restricted to
 * @param {number} [options.dataPassId] if provided a cell become link to QC flag page for given data pass
 * @param {number} [options.simulationPassId] if provided a cell become link to QC flag page for given simulation pass
 * @param {QcSummary} qcSummary QC summary for data/simulation pass
 * @return {object} active columns configuration
 */
export const createRunDetectorsAsyncQcActiveColumns = (dplDetectors, { profiles, dataPassId, simulationPassId, qcSummary } = {}) =>
    Object.fromEntries(dplDetectors?.map(({ name: detectorName, id: dplDetectorId }) => [
        detectorName, {
            name: detectorName.toUpperCase(),
            visible: true,
            format: (_, run) => {
                if (dataPassId && simulationPassId) {
                    throw new Error('`dataPassId` are `simulationPassId` are exclusive options');
                }

                const detectorWasActiveDuringRun = Boolean(run.detectorsQualities.find(({ name }) => name === detectorName));
                if (!detectorWasActiveDuringRun) {
                    return null;
                }

                const detectorQualityDisplay = runDetectorAsyncQualityDisplay(run.runNumber, dplDetectorId, qcSummary);

                if (dataPassId) {
                    return frontLink(
                        detectorQualityDisplay,
                        'qc-flags-for-data-pass',
                        {
                            dataPassId,
                            runNumber: run.runNumber,
                            dplDetectorId,
                        },
                    );
                }
                if (simulationPassId) {
                    return frontLink(
                        detectorQualityDisplay,
                        'qc-flags-for-simulation-pass',
                        {
                            simulationPassId,
                            runNumber: run.runNumber,
                            dplDetectorId,
                        },
                    );
                }

                return detectorQualityDisplay;
            },
            profiles,
        },
    ]) ?? []);
