/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

import { frontLink } from '../common/navigation/frontLink.js';

/**
 * Render link to QC flag overview page
 *
 * @param {*} content content to display
 * @param {number} [scope.dataPassId] data pass id - exclusive with simulationPassId parameter
 * @param {number} [scope.simulationPassId] simulation pass id - exclusive with dataPassId parameter
 * @param {number} scope.runNumber run number
 * @param {number} scope.dplDetectorId DPL detector id
 * @param {object} [attributes] attributes @see frontLink attributes parameter
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
        options = {};
        pageName = 'synchronous-qc-flags';
    }
    return frontLink(
        content,
        pageName,
        { runNumber, dplDetectorId, ...options },
        { title: 'QC flags overview', ...attributes },
    );
};
