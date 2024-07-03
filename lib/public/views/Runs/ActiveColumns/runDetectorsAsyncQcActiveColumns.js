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
import { h, iconBan, iconX, RemoteData, iconWarning } from '/js/src/index.js';
import { formatFloat } from '../../../utilities/formatting/formatFloat.js';
import { isContrastBlack } from '../../../components/common/badge.js';
import { qcFlagCreationPanelLink, qcFlagOverviewPanelLink } from '../../../components/qcFlags/qcFlagsPagesButtons.js';
import { VIRTUAL_DETECTOR_NAME } from '../../../domain/enums/detectorsNames.mjs';
import { QC_SUMMARY_COLORS } from '../../../components/qcFlags/qcSummaryColors.js';
import { tooltip } from '../../../components/common/popover/tooltip.js';
import { getRunNotSubjectToQcReason, isRunNotSubjectToQc } from '../../../components/qcFlags/isRunSubjectToQc.js';

/**
 * Render QC summary for given run and detector
 *
 * @param {object} monalisaProduction id of the production -- data pass or simulation pass
 * @param {number} [monalisaProduction.dataPassId] data pass id -- exclusive with `simulationPassId`
 * @param {number} [monalisaProduction.simulationPassId] simulation pass id -- exclusive with `dataPassId`
 * @param {Run} run a run
 * @param {number} dplDetectorId id of the detector
 * @param {QcSummary} qcSummary QC summary
 * @return {Component} component
 */
const runDetectorAsyncQualityDisplay = ({ dataPassId, simulationPassId }, run, dplDetectorId, qcSummary) => {
    const { runNumber } = run;

    const {
        badEffectiveRunCoverage = null,
        explicitlyNotBadEffectiveRunCoverage = null,
        missingVerificationsCount = 0,
    } = qcSummary[runNumber][dplDetectorId];

    const notBadPercentageFormat = [
        h('span', formatFloat((1 - badEffectiveRunCoverage) * 100, { precision: 0 })),
        h('.d-inline-block.va-t-bottom', missingVerificationsCount
            ? tooltip(
                h('.f7', iconWarning()),
                `Missing ${missingVerificationsCount} verification${missingVerificationsCount > 1 ? 's' : ''}`,
            )
            : null),
    ];

    /**
     * Format QC summary with color
     * @param {*} content content
     * @param {string} [configuration.color] background color
     * @returns {Component} QC summary display
     */
    const getQcSummaryDisplayWithColor = (content, { color }) => h(
        '.btn.w-100',
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

    qcSummaryDisplay = isRunNotSubjectToQc(run)
        ? tooltip(qcSummaryDisplay, getRunNotSubjectToQcReason(run))
        : qcSummaryDisplay;

    return qcFlagOverviewPanelLink(
        qcSummaryDisplay,
        { dataPassId, simulationPassId, runNumber, dplDetectorId },
    );
};

/**
 * Factory for detectors related active columns configuration
 *
 * @param {DplDetector[]} dplDetectors detectors list
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
    dplDetectors,
    remoteDplDetectorsUserHasAccessTo,
    { dataPassId, simulationPassId },
    { profiles, qcSummary } = {},
) =>
    Object.fromEntries(dplDetectors?.map(({ name: detectorName, id: dplDetectorId }) => [
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

                if (!qcSummary?.[runNumber]?.[dplDetectorId]) { // If there is no QC flag assigned
                    return isRunNotSubjectToQc(run)
                        ? h('.text-center', tooltip(iconX(), getRunNotSubjectToQcReason(run)))
                        : qcFlagCreationPanelLink(
                            { dataPassId, simulationPassId },
                            RemoteData.Success(run),
                            dplDetectorId,
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
                    dplDetectorId,
                    qcSummary,
                );
            },
            profiles,
        },
    ]) ?? []);
