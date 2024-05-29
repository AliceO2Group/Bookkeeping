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
import { dplDetectorsProvider } from '../../services/detectors/dplDetectorsProvider.js';
import { getRoleForDetector } from '../../utilities/getRoleForDetector.js';
import { frontLink } from '../common/navigation/frontLink.js';
import { tooltip } from '../common/popover/tooltip.js';
import { h, iconPlus, sessionService } from '/js/src/index.js';

/**
 * Render link to QC flag creation page
 * @param {number} [scope.dataPassId] data pass id - exclusive with simulationPassId parameter
 * @param {number} [scope.simulationPassId] simulation pass id - exclusive with dataPassId parameter
 * @param {number} scope.runNumber run number
 * @param {number} scope.dplDetectorId DPL detector id
 * @return {Component} link
 */
export const qcFlagCreationPanelLink = ({ dataPassId, simulationPassId, runNumber, dplDetectorId }) => {
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
        return;
    }

    const disabledButton = h('button.btn.btn-primary', { disabled: true }, content);
    return dplDetectorsProvider.physical$.getCurrent().match({
        NotAsked: () => tooltip(disabledButton, `Unable to determine permissions on detector ${dplDetectorId}`),
        Loading: () => tooltip(disabledButton, 'Loading...'),
        Failure: () => tooltip(disabledButton, `Unable to determine permissions on detector ${dplDetectorId} because of error`),
        Success: (detectors) => {
            const detector = detectors.find(({ id }) => id === dplDetectorId);
            if (sessionService.session?.access?.includes(BkpRoles.ADMIN)
                || detector && sessionService.session?.access?.includes(getRoleForDetector(detector.name))) {
                return frontLink(
                    content,
                    pageName,
                    { runNumber, dplDetectorId, ...options },
                    {
                        class: 'btn btn-primary',
                        title: 'Create a QC flag',
                    },
                );
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
        return;
    }
    return frontLink(
        content,
        pageName,
        { runNumber, dplDetectorId, ...options },
        { title: 'Create a quality control flag', ...attributes },
    );
};
