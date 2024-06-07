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

import { BkpRoles } from '../../domain/enums/BkpRoles.js';
import { RunQualities } from '../../domain/enums/RunQualities.js';
import { dplDetectorsProvider } from '../../services/detectors/dplDetectorsProvider.js';
import { getRoleForDetector } from '../../utilities/getRoleForDetector.js';
import { frontLink } from '../common/navigation/frontLink.js';
import { tooltip } from '../common/popover/tooltip.js';
import { h, iconPlus, sessionService, iconWarning } from '/js/src/index.js';

/**
 * Render link to QC flag creation page
 * @param {object} production id of the production
 * @param {number} [production.dataPassId] data pass id - exclusive with simulationPassId parameter
 * @param {number} [production.simulationPassId] simulation pass id - exclusive with dataPassId parameter
 * @param {RemoteData<Run>} remoteRun a run
 * @param {number} dplDetectorId id of the detector
 * @return {Component} link
 */
export const qcFlagCreationPanelLink = ({ dataPassId, simulationPassId }, remoteRun, dplDetectorId) => {
    const content = h('.flex-row.items-center.g1', [h('small', iconPlus()), 'QC']);
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

    return dplDetectorsProvider.physical$.getCurrent().match({
        NotAsked: () => null,
        Loading: () => null,
        Failure: () => tooltip(
            h('button.btn.btn-primary', { disabled: true }, content),
            `An error has occurred. Unable to determine permissions on detector with id ${dplDetectorId}`,
        ),
        Success: (detectors) => {
            const detector = detectors.find(({ id }) => id === dplDetectorId);
            if (sessionService.session?.access?.includes(BkpRoles.ADMIN)
                || detector && sessionService.session?.access?.includes(getRoleForDetector(detector.name))) {
                return remoteRun.match({
                    NotAsked: () => null,
                    Loading: () => null,
                    Failure: () => tooltip(h('.f3', iconWarning()), 'An error has occurred. Unable to determine whether run is subject for QC'),
                    Success: ({ runNumber, runQuality }) =>
                        runQuality === RunQualities.BAD
                            ? tooltip(
                                h('button.btn.btn-primary', { disabled: true }, content),
                                `Quality of the run was changed to ${RunQualities.BAD} so it is no more subject for QC`,
                            )
                            : frontLink(
                                content,
                                pageName,
                                { runNumber, dplDetectorId, ...options },
                                {
                                    class: 'btn btn-primary',
                                    title: 'Create a QC flag',
                                },
                            ),
                });
            } else {
                return null;
            }
        },
    });
};

/**
 * Render link to QC flag overview page
 * @param {*} content content to display
 * @param {number} [scope.dataPassId] data pass id - exclusive with simulationPassId parameter
 * @param {number} [scope.simulationPassId] simulation pass id - exclusive with dataPassId parameter
 * @param {number} scope.runNumber run number
 * @param {number} scope.dplDetectorId DPL detector id
 * @param {object} [attributes] attributes @see fronLink attributes parameter
 * @return {Component} link
 */
export const qcFlagOverviewPanelLink = (content, { dataPassId, simulationPassId, runNumber, dplDetectorId }, attributes = {}) => {
    let options = {};
    let pageName = '';
    if (dataPassId) {
        options = { dataPassId };
        pageName = 'qc-flags-for-data-pass';
    } else if (simulationPassId) {
        options = { simulationPassId };
        pageName = 'qc-flags-for-simulation-pass';
    } else {
        return null;
    }
    return frontLink(
        content,
        pageName,
        { runNumber, dplDetectorId, ...options },
        { title: 'Create a quality control flag', ...attributes },
    );
};
