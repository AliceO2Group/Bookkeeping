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
import { h, iconPlus } from '/js/src/index.js';

/**
 * Render link to QC flag creation page
 * @param {number} [scope.dataPassId] data pass id - exclusive with simulationPassId parameter
 * @param {number} [scope.simulationPassId] simulation pass id - exclusive with dataPassId parameter
 * @param {number} scope.runNumber run number
 * @param {number} scope.dplDetectorId DPL detector id
 * @return {Component} link
 */
export const qcFlagCreationPanelLink = ({ dataPassId, simulationPassId, runNumber, dplDetectorId }) => {
    if (dataPassId) {
        return frontLink(
            h('.flex-row.items-center.g1', [h('small', iconPlus()), 'QC']),
            'qc-flag-creation-for-data-pass',
            { runNumber, dataPassId, dplDetectorId },
            {
                class: 'btn btn-primary',
                title: 'Create a QC flag',
            },
        );
    } else if (simulationPassId) {
        return frontLink(
            h('.flex-row.items-center.g1', [h('small', iconPlus()), 'QC']),
            'qc-flag-creation-for-simulation-pass',
            { runNumber, simulationPassId, dplDetectorId },
            {
                class: 'btn btn-primary',
                title: 'Create a QC flag',
            },
        );
    }
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
    if (dataPassId) {
        return frontLink(
            content,
            'qc-flags-for-data-pass',
            {
                dataPassId,
                runNumber,
                dplDetectorId,
            },
            {
                title: 'Create a quality control flag',
                ...attributes,
            },
        );
    }
    if (simulationPassId) {
        return frontLink(
            content,
            'qc-flags-for-simulation-pass',
            {
                simulationPassId,
                runNumber,
                dplDetectorId,
            },
            {
                title: 'Create a quality control flag',
                ...attributes,
            },
        );
    }
};
