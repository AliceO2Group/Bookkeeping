/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { h, iconWarning } from '/js/src/index.js';
import { qcFlagCreationComponent } from '../qcFlagCreationComponent.js';
import spinner from '../../../../components/common/spinner.js';
import { frontLink } from '../../../../components/common/navigation/frontLink.js';
import { breadcrumbs } from '../../../../components/common/navigation/breadcrumbs.js';
import { tooltip } from '../../../../components/common/popover/tooltip.js';

/**
 * Render Quality Control Flag For Data Pass creation page
 * @param {Model} model The overall model object
 * @returns {Component} creation page
 */
export const QcFlagCreationForDataPassPage = ({ qcFlags: { creationForDataPassModel: qcFlagCreationForDataPassModel } }) => {
    const {
        run: remoteRun,
        dplDetector: remoteDplDetector,
        dataPass: remoteDataPass,
        runNumber,
        dataPassId,
        dplDetectorId,
    } = qcFlagCreationForDataPassModel;

    const commonTitle = h('h2', 'QC');
    return [
        h('.flex-row.justify-between.items-center', [
            h('.flex-row.g1.items-center', [
                remoteDataPass.match({
                    Success: (dataPass) => remoteRun.match({
                        Success: (run) => remoteDplDetector.match({
                            Success: (dplDetector) => breadcrumbs([
                                commonTitle,
                                h('h2', frontLink(dataPass.name, 'runs-per-data-pass', { dataPassId: dataPass.id })),
                                h('h2', frontLink(run.runNumber, 'run-detail', { runNumber: run.runNumber })),
                                h('h2', dplDetector.name),
                            ]),
                            Failure: () => [commonTitle, tooltip(h('.f3', iconWarning()), 'Not able to load detector info')],
                            Loading: () => [commonTitle, h('', spinner({ size: 2, absolute: false }))],
                            NotAsked: () => [commonTitle, tooltip(h('.f3', iconWarning()), 'No detector data was asked for')],
                        }),
                        Failure: () => [commonTitle, tooltip(h('.f3', iconWarning()), 'Not able to load run info')],
                        Loading: () => [commonTitle, h('', spinner({ size: 2, absolute: false }))],
                        NotAsked: () => [commonTitle, tooltip(h('.f3', iconWarning()), 'No run data was asked for')],
                    }),
                    Failure: () => [commonTitle, tooltip(h('.f3', iconWarning()), 'Not able to load data pass info')],
                    Loading: () => [commonTitle, h('', spinner({ size: 2, absolute: false }))],
                    NotAsked: () => [commonTitle, tooltip(h('.f3', iconWarning()), 'No data pass data was asked for')],
                }),
            ]),
            frontLink(
                h('.flex-row.items-center.g1', 'QC'),
                'qc-flags-for-data-pass',
                {
                    runNumber,
                    dataPassId,
                    dplDetectorId,
                },
                {
                    class: 'btn btn-primary',
                    title: 'Create a quality control flag',
                },
            ),
        ]),
        qcFlagCreationComponent(qcFlagCreationForDataPassModel),
    ];
};
