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
import { isRunNotSubjectToQc } from './isRunNotSubjectToQc.js';
import { h, iconPlus } from '/js/src/index.js';
import { getRunQcExclusionReason } from './getRunQcExclusionReason.js';

/**
 * Render link to QC flag creation page
 * @param {object} production object with dataPassId or simulationPassId
 * @param {DataPass} [production.dataPass] data pass - exclusive with simulationPassId parameter
 * @param {SimulationPass} [production.simulationPass] simulation pass - exclusive with dataPassId parameter
 * @param {Run} run run
 * @param {Detector|null} detector DPL detector if user has access to it, null if not
 * @param {object} [options] display options
 * @param {Component} [options.noPermissionContent] a display in case user has no permission to manage QC flags for given detector
 * @property {string[]} [linkClasses] css classes to apply to the link (in addition to the default ones)
 * @return {Component} link
 */
export const qcFlagCreationPanelLink = (
    { dataPass, simulationPass },
    run,
    detector,
    { noPermissionContent = null, linkClasses = [] } = {},
) => {
    const content = [h('.flex-row.items-center.g1', [h('small', iconPlus()), 'QC'])];

    if (isRunNotSubjectToQc(run)) {
        return h('button.btn.btn-primary', { disabled: true, title: getRunQcExclusionReason(run) }, content);
    }

    if (!detector) {
        return noPermissionContent;
    }

    let options = {};
    let pageName = '';
    if (dataPass) {
        if (dataPass.frozen) {
            return h('button.btn.btn-primary', { disabled: true, title: 'Datapass is frozen' }, content);
        }

        options = { dataPassId: dataPass.id };
        pageName = 'qc-flag-creation-for-data-pass';
    } else if (simulationPass) {
        options = { simulationPassId: simulationPass.id };
        pageName = 'qc-flag-creation-for-simulation-pass';
    } else {
        return null;
    }

    return h('div.flex-row.align-center', [
        frontLink(
            content,
            pageName,
            { runNumberDetectorsMap: `${run.runNumber}:${detector.id}`, ...options },
            {
                class: ['btn', 'btn-primary', ...linkClasses].join(' '),
                title: 'Create a QC flag',
            },
        ),
    ]);
};
