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
import { h, iconBan, iconX } from '/js/src/index.js';
import { qcFlagCreationPanelLink } from '../../../components/qcFlags/qcFlagCreationPanelLink.js';
import { tooltip } from '../../../components/common/popover/tooltip.js';
import { isRunNotSubjectToQc } from '../../../components/qcFlags/isRunNotSubjectToQc.js';
import { getQcSummaryDisplay } from './getQcSummaryDisplay.js';
import { getRunQcExclusionReason } from '../../../components/qcFlags/getRunQcExclusionReason.js';
import { qcFlagOverviewPanelLink } from '../../../components/qcFlags/qcFlagOverviewPanelLink.js';
import { remoteDplDetectorUserHasAccessTo } from '../../../services/detectors/remoteDplDetectorUserHasAccessTo.js';
import errorAlert from '../../../components/common/errorAlert.js';
import spinner from '../../../components/common/spinner.js';

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
        ? tooltip(qcSummaryDisplay, getRunQcExclusionReason(run))
        : qcSummaryDisplay;

    return qcFlagOverviewPanelLink(
        qcSummaryDisplay,
        { dataPassId, simulationPassId, runNumber, dplDetectorId },
    );
};

/**
 * Factory for detectors related active columns configuration
 *
 * @param {RunDetectorsSelectionModel} runDetectorsSelectionModel the run/detectors selection model
 * @param {DplDetector[]} dplDetectors detectors list
 * @param {RemoteData<DplDetector[]>} remoteDplDetectorsUserHasAccessTo dpl detectors list remote data
 * @param {object} monalisaProduction id of the production -- data pass or simulation pass
 * @param {number} [monalisaProduction.dataPass] data pass containing the run -- exclusive with `simulationPass`
 * @param {number} [monalisaProduction.simulationPass] simulation pass containing the run -- exclusive with `dataPass`
 * @param {object} configuration display configuration
 * @param {object|string|string[]} [configuration.profiles] profiles which the column is restricted to
 * @param {QcSummary} [configuration.qcSummary] QC summary for given data/simulation pass
 * @return {object} active columns configuration
 */
export const createRunDetectorsAsyncQcActiveColumns = (
    runDetectorsSelectionModel,
    dplDetectors,
    remoteDplDetectorsUserHasAccessTo,
    { dataPass, simulationPass },
    { profiles, qcSummary } = {},
) => {
    if (!dataPass && !simulationPass) {
        throw new Error('`dataPass` or `simulationPass` is required');
    }
    if (dataPass && simulationPass) {
        throw new Error('`dataPass` and `simulationPass` are exclusive options');
    }

    return Object.fromEntries(dplDetectors?.map(({ name: detectorName, id: dplDetectorId }) => [
        detectorName,
        {
            name: detectorName.toUpperCase(),
            visible: true,
            format: (_, run) => remoteDplDetectorUserHasAccessTo(dplDetectorId, remoteDplDetectorsUserHasAccessTo).match({
                NotAsked: () => null,
                Failure: (errors) => errorAlert(errors),
                Success: (detectorUserHasAccessTo) => {
                    const detectorWasActiveDuringRun = Boolean(run.detectorsQualities.find(({ name }) => name === detectorName));
                    if (!detectorWasActiveDuringRun) {
                        return null;
                    }

                    const { runNumber } = run;

                    const runExcludedFromQc = isRunNotSubjectToQc(run);

                    const checkbox = !runExcludedFromQc && detectorUserHasAccessTo && h(
                        'input.select-multi-flag',
                        {
                            type: 'checkbox',
                            checked: runDetectorsSelectionModel.isRunDetectorSelected(run.runNumber, dplDetectorId),
                            onchange: (e) => e.target.checked
                                ? runDetectorsSelectionModel.selectRunDetector(run.runNumber, dplDetectorId)
                                : runDetectorsSelectionModel.unselectRunDetector(run.runNumber, dplDetectorId),
                        },
                    );

                    if (!qcSummary?.[runNumber]?.[dplDetectorId]) { // If there is no QC flag assigned
                        return runExcludedFromQc
                            ? h('.text-center', tooltip(iconX(), getRunQcExclusionReason(run)))
                            : h('.flex-row.items-center.gc1', [
                                checkbox,
                                qcFlagCreationPanelLink(
                                    { dataPass, simulationPass },
                                    run,
                                    detectorUserHasAccessTo,
                                    {
                                        noPermissionContent: h('.text-center', tooltip(
                                            h('.gray.badge', iconBan()),
                                            'No QC flag was assigned. You have no permission to manage QC flag for this detector',
                                        )),
                                        linkClasses: ['w-100'],
                                    },
                                ),
                            ]);
                    }

                    return h('.flex-row.items-center.gc1', [
                        checkbox,
                        runDetectorAsyncQualityDisplay(
                            { dataPassId: dataPass?.id, simulationPassId: simulationPass?.id },
                            run,
                            dplDetectorId,
                            qcSummary,
                        ),
                    ]);
                },
                Loading: () => spinner(),
            }),
            profiles,
        },
    ]) ?? []);
};
