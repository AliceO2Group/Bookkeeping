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

import { dplDetectorsProvider } from '../../services/detectors/dplDetectorsProvider.js';
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

    return dplDetectorsProvider.physical$.getCurrent().match({
        Other: () => h('button.btn.btn-primary', { disabled: true }, content),
        Success: (detectors) => {
            const detector = detectors.find(({ id }) => id === dplDetectorId);
            if (detector && sessionService.session?.access?.includes(`det-${detector.name.toLowerCase()}`)) {
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
                return tooltip(
                    h('button.btn.btn-primary', { disabled: true }, content),
                    detector ? `You have no right to create QC flag for ${detector.name} detector` : null,
                );
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
