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
import { h, iconBan, iconX, RemoteData, iconWarning, iconBolt } from '/js/src/index.js';
import { formatFloat } from '../../../utilities/formatting/formatFloat.js';
import { getValueFromCssVar, isContrastBlack } from '../../../components/common/badge.js';
import { qcFlagCreationPanelLink, qcFlagOverviewPanelLink } from '../../../components/qcFlags/qcFlagsPagesButtons.js';
import { VIRTUAL_DETECTOR_NAME } from '../../../domain/enums/detectorsNames.mjs';
import { QC_SUMMARY_COLORS } from '../../../components/qcFlags/qcSummaryColors.js';
import { tooltip } from '../../../components/common/popover/tooltip.js';
import { getRunNotSubjectToQcReason, isRunNotSubjectToQc } from '../../../components/qcFlags/isRunSubjectToQc.js';

const FULL_COVERAGE = 1;

/**
 * Render QC summary for given run and detector
 *
 * @param {object} monalisaProduction id of the production -- data pass or simulation pass
 * @param {number} [monalisaProduction.dataPassId] data pass id -- exclusive with `simulationPassId`
 * @param {number} [monalisaProduction.simulationPassId] simulation pass id -- exclusive with `dataPassId`
 * @param {Run} run a run
 * @param {number} detectorId id of the detector
 * @param {QcSummary} qcSummary QC summary
 * @return {Component} component
 */
const runDetectorAsyncQualityDisplay = ({ dataPassId, simulationPassId }, run, detectorId, qcSummary) => {
    const { runNumber } = run;

    const {
        badEffectiveRunCoverage = null,
        explicitlyNotBadEffectiveRunCoverage = null,
        missingVerificationsCount = 0,
        mcReproducible,
    } = qcSummary[runNumber][detectorId];

    const missingVerificationMessage = `Missing ${missingVerificationsCount} verification${missingVerificationsCount > 1 ? 's' : ''}`;
    const missingVerificationDisplay = missingVerificationsCount
        ? h(
            '.d-inline-block.va-t-bottom',
            tooltip(h('.f7', iconWarning()), missingVerificationMessage),
        )
        : null;

    const notBadPercentageFormat = h('span', formatFloat((1 - badEffectiveRunCoverage) * 100, { precision: 0 }));

    const nonMcReproducibleQcSummaryContent = [
        notBadPercentageFormat,
        missingVerificationDisplay,
    ];

    /**
     * Format QC summary with color
     * @param {*} content content
     * @param {string} [configuration.color] the color to look for contrast,
     * in hexa RGB or CSS var() function over variable name expression: e.g. "var(--color-nice)"
     * @returns {Component} QC summary display
     */
    const getQcSummaryDisplayWithColor = (content, { color }) => h(
        '.btn.w-100',
        { style: {
            backgroundColor: color,
            color: isContrastBlack(/var\(.+\)/.test(color) ? getValueFromCssVar(color.slice(4, -1)) : color) ? 'black' : 'white',
        } },
        content,
    );

    let qcSummaryDisplay = null;
    if ([badEffectiveRunCoverage, explicitlyNotBadEffectiveRunCoverage].includes(null)) {
        qcSummaryDisplay = getQcSummaryDisplayWithColor(
            [
                h('.d-inline-block', tooltip(
                    iconBolt(),
                    'Run start or stop is missing and time-based flag was assigned, coverage cannot be calculated',
                )),
                missingVerificationDisplay,
            ],
            {
                color: QC_SUMMARY_COLORS.INCALCULABLE_COVERAGE,
            },
        );
    } else if (!badEffectiveRunCoverage) {
        qcSummaryDisplay = getQcSummaryDisplayWithColor(
            nonMcReproducibleQcSummaryContent,
            {
                color: explicitlyNotBadEffectiveRunCoverage === FULL_COVERAGE
                    ? QC_SUMMARY_COLORS.ALL_GOOD
                    : QC_SUMMARY_COLORS.PARTIALLY_GOOD_NOT_BAD,
            },
        );
    } else if (!explicitlyNotBadEffectiveRunCoverage && mcReproducible) {
        qcSummaryDisplay = getQcSummaryDisplayWithColor(
            [
                notBadPercentageFormat,
                h('em.d-inline-block.va-top.f7', 'MC.R'),
                missingVerificationDisplay,
            ],
            { color: QC_SUMMARY_COLORS.NO_GOOD_AND_LIMITED_ACCEPTANCE_MC_REPRODUCBILE },
        );
    } else {
        qcSummaryDisplay = getQcSummaryDisplayWithColor(
            nonMcReproducibleQcSummaryContent,
            {
                color: badEffectiveRunCoverage === FULL_COVERAGE
                    ? QC_SUMMARY_COLORS.ALL_BAD
                    : QC_SUMMARY_COLORS.PARTIALLY_BAD,
            },
        );
    }

    qcSummaryDisplay = isRunNotSubjectToQc(run)
        ? tooltip(qcSummaryDisplay, getRunNotSubjectToQcReason(run))
        : qcSummaryDisplay;

    return qcFlagOverviewPanelLink(
        qcSummaryDisplay,
        { dataPassId, simulationPassId, runNumber, detectorId },
    );
};

/**
 * Factory for detectors related active columns configuration
 *
 * @param {DplDetector[]} detectors detectors list
 * @param {RemoteData<DplDetector[]>} remoteDplDetectorsUserHasAccessTo dpl detectors list remote data
 * @param {object} monalisaProduction id of the production -- data pass or simulation pass
 * @param {number} [monalisaProduction.dataPassId] data pass id -- exclusive with `simulationPassId`
 * @param {number} [monalisaProduction.simulationPassId] simulation pass id -- exclusive with `dataPassId`
 * @param {object} configuration display configuration
 * @param {object|string|string[]} [configuration.profiles] profiles which the column is restricted to
 * @param {QcSummary} [configuration.qcSummary] QC summary for given data/simulation pass
 * @return {object} active columns configuration
 */
export const createRunDetectorsAsyncQcActiveColumns = (
    detectors,
    remoteDplDetectorsUserHasAccessTo,
    { dataPassId, simulationPassId },
    { profiles, qcSummary } = {},
) =>
    Object.fromEntries(detectors?.map(({ name: detectorName, id: detectorId }) => [
        detectorName,
        {
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

                const { runNumber } = run;

                if (!qcSummary?.[runNumber]?.[detectorId]) { // If there is no QC flag assigned
                    return isRunNotSubjectToQc(run)
                        ? h('.text-center', tooltip(iconX(), getRunNotSubjectToQcReason(run)))
                        : qcFlagCreationPanelLink(
                            { dataPassId, simulationPassId },
                            RemoteData.Success(run),
                            detectorId,
                            remoteDplDetectorsUserHasAccessTo,
                            {
                                noPermissionContent: h('.text-center', tooltip(
                                    h('.gray.badge', iconBan()),
                                    'No QC flag was assigned. You have no permission to manage QC flag for this detector',
                                )),
                                linkClasses: ['w-100'],
                            },
                        );
                }

                return runDetectorAsyncQualityDisplay(
                    { dataPassId, simulationPassId },
                    run,
                    detectorId,
                    qcSummary,
                );
            },
            profiles,
        },
    ]) ?? []);
