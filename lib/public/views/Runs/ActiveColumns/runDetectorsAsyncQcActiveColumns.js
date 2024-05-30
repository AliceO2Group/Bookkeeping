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
import { formatFloat } from '../../../utilities/formatting/formatFloat.js';
import { isContrastBlack } from '../../../components/common/badge.js';
import { qcFlagCreationPanelLink, qcFlagOverviewPanelLink } from '../../../components/qcFlags/qcFlagsPagesButtons.js';
import { VIRTUAL_DETECTOR_NAME } from '../../../domain/enums/detectorsNames.mjs';
import { QC_SUMMARY_COLORS } from '../../../components/qcFlags/qcSummaryColors.js';

/**
 * Render QC summary for given run and detector
 * @param {number} runNumber run number
 * @param {number} dplDetectorId id of the detector
 * @param {object} production id of the production
 * @param {number} production.dataPassId data pass id
 * @param {number} production.simulationPassId simulation pass id
 * @param {QcSummary} qcSummary QC summary
 * @return {Component} component
 */
const runDetectorAsyncQualityDisplay = (runNumber, dplDetectorId, { dataPassId, simulationPassId }, qcSummary) => {
    if (!qcSummary?.[runNumber]?.[dplDetectorId]) { // If there is no QC flag assigned
        return qcFlagCreationPanelLink({ dataPassId, simulationPassId, runNumber, dplDetectorId });
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
     * Format QC summary with color
     * @param {*} content content
     * @param {string} [configuration.color] background color
     * @returns {Component} QC summary display
     */
    const getQcSummaryDisplayWithColor = (content, { color }) => h(
        'span.btn.w-100',
        { style: {
            backgroundColor: color,
            color: isContrastBlack(color) ? 'black' : 'white',
        } },
        content,
    );

    let qcSummaryDisplay = null;
    if (!badEffectiveRunCoverage) {
        if (explicitlyNotBadEffectiveRunCoverage === 1) {
            qcSummaryDisplay = getQcSummaryDisplayWithColor(notBadPercentageFormat, { color: QC_SUMMARY_COLORS.ALL_GOOD });
        } else {
            qcSummaryDisplay = getQcSummaryDisplayWithColor(notBadPercentageFormat, { color: QC_SUMMARY_COLORS.PARTIALLY_GOOD_NOT_BAD });
        }
    } else {
        if (badEffectiveRunCoverage === 1) {
            qcSummaryDisplay = getQcSummaryDisplayWithColor(notBadPercentageFormat, { color: QC_SUMMARY_COLORS.ALL_BAD });
        } else {
            qcSummaryDisplay = getQcSummaryDisplayWithColor(notBadPercentageFormat, { color: QC_SUMMARY_COLORS.PARTIALLY_BAD });
        }
    }

    return qcFlagOverviewPanelLink(qcSummaryDisplay, { dataPassId, simulationPassId, runNumber, dplDetectorId });
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
                if (!dataPassId && !simulationPassId) {
                    throw new Error('`dataPassId` or `simulationPassId` is required');
                }
                if (dataPassId && simulationPassId) {
                    throw new Error('`dataPassId` and `simulationPassId` are exclusive options');
                }

                const detectorWasActiveDuringRun = Boolean(run.detectorsQualities.find(({ name }) => name === detectorName));
                if (!detectorWasActiveDuringRun && detectorName !== VIRTUAL_DETECTOR_NAME.GLO) {
                    return null;
                }

                const detectorQualityDisplay = runDetectorAsyncQualityDisplay(
                    run.runNumber,
                    dplDetectorId,
                    { dataPassId, simulationPassId },
                    qcSummary,
                );

                return detectorQualityDisplay;
            },
            profiles,
        },
    ]) ?? []);
