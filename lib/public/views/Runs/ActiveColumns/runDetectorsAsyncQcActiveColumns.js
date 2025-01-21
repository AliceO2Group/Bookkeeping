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
import { h, iconBan, iconX, RemoteData } from '/js/src/index.js';
import { qcFlagCreationPanelLink, qcFlagOverviewPanelLink } from '../../../components/qcFlags/qcFlagsPagesButtons.js';
import { tooltip } from '../../../components/common/popover/tooltip.js';
import { getRunNotSubjectToQcReason, isRunNotSubjectToQc } from '../../../components/qcFlags/isRunSubjectToQc.js';
import { getQcSummaryDisplay } from './getQcSummaryDisplay.js';

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

    let qcSummaryDisplay = getQcSummaryDisplay(qcSummary[runNumber][dplDetectorId]);

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
    { profiles, qcSummary, overviewModel } = {},
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
                if (!detectorWasActiveDuringRun) {
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
                                overviewModel,
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
