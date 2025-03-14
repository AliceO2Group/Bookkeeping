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

import { frontLink } from '../common/navigation/frontLink.js';
import { tooltip } from '../common/popover/tooltip.js';
import { isRunNotSubjectToQc } from './isRunNotSubjectToQc.js';
import { h, iconPlus, iconWarning } from '/js/src/index.js';
import { getRunQcExclusionReason } from './getRunQcExclusionReason.js';

/**
 * Render link to QC flag creation page
 * @param {object} production object with dataPassId or simulationPassId
 * @param {number} [production.dataPassId] data pass id - exclusive with simulationPassId parameter
 * @param {number} [production.simulationPassId] simulation pass id - exclusive with dataPassId parameter
 * @param {RemoteData<Run>} remoteRun run remote data
 * @param {number} dplDetectorId DPL detector id
 * @param {RemoteData<DplDetector[]>} remoteDplDetectorsUserHasAccessTo dpl detectors list remote data
 * @param {object} [options] display options
 * @param {Component} [options.noPermissionContent] a display in case user has no permission to manage QC flags for given detector
 * @property {string[]} [linkClasses] css classes to apply to the link (in addition to the default ones)
 * @return {Component} link
 */
export const qcFlagCreationPanelLink = (
    { dataPassId, simulationPassId },
    remoteRun,
    dplDetectorId,
    remoteDplDetectorsUserHasAccessTo,
    { noPermissionContent = null, linkClasses = [] } = {},
) => {
    const content = [h('.flex-row.items-center.g1', [h('small', iconPlus()), 'QC'])];
    let options = {};
    let pageName = '';
    if (dataPassId) {
        options = { dataPassId };
        pageName = 'qc-flag-creation-for-data-pass';
    } else if (simulationPassId) {
        options = { simulationPassId };
        pageName = 'qc-flag-creation-for-simulation-pass';
    } else {
        return null;
    }

    return remoteDplDetectorsUserHasAccessTo.match({
        NotAsked: () => null,
        Loading: () => null,
        Failure: () => tooltip(
            h('button.btn.btn-primary', { disabled: true }, content),
            `An error has occurred. Unable to determine permissions on detector with id ${dplDetectorId}`,
        ),
        Success: (detectors) => {
            const userHasAccessToDetector = detectors.find(({ id }) => id === dplDetectorId);

            if (userHasAccessToDetector) {
                return remoteRun.match({
                    NotAsked: () => null,
                    Loading: () => null,
                    Failure: () => tooltip(h('.f3', iconWarning()), 'An error has occurred. Unable to determine whether run is subject for QC'),
                    Success: (run) => isRunNotSubjectToQc(run)
                        ? h('button.btn.btn-primary', { disabled: true, title: getRunQcExclusionReason(run) }, content)
                        : h('div.flex-row.align-center', [
                            frontLink(
                                content,
                                pageName,
                                { runNumberDetectorsMap: `${run.runNumber}:${dplDetectorId}`, ...options },
                                {
                                    class: ['btn', 'btn-primary', ...linkClasses].join(' '),
                                    title: 'Create a QC flag',
                                },
                            ),
                        ]),
                });
            } else {
                return noPermissionContent;
            }
        },
    });
};
