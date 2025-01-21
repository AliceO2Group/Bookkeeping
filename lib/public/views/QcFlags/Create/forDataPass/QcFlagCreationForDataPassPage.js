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

import { h } from '/js/src/index.js';
import { qcFlagCreationComponent } from '../qcFlagCreationComponent.js';
import { frontLink } from '../../../../components/common/navigation/frontLink.js';
import { tooltip } from '../../../../components/common/popover/tooltip.js';
import { iconWarning } from '/js/src/icons.js';
import spinner from '../../../../components/common/spinner.js';

/**
 * Render Quality Control Flag For Data Pass creation page
 * @param {Model} model The overall model object
 * @returns {Component} creation page
 */
export const QcFlagCreationForDataPassPage = ({ qcFlags: { creationForDataPassModel: qcFlagCreationForDataPassModel } }) => {
    const {
        dataPass: remoteDataPass,
    } = qcFlagCreationForDataPassModel;

    return [
        h('h2.g2.flex-row.items-center', [
            h('div', 'Create QC flag'),
            remoteDataPass?.match({
                Success: ({ id, name }) => [
                    h('', ' for datapass '),
                    frontLink(name, 'runs-per-data-pass', { dataPassId: id }),
                ],
                Failure: () => tooltip(h('.f3', iconWarning()), 'Not able to load data pass info'),
                Loading: () => h('', spinner({ size: 2, absolute: false })),
                NotAsked: () => tooltip(h('.f3', iconWarning()), 'No data pass data was asked for'),
            }),
        ]),
        qcFlagCreationComponent(qcFlagCreationForDataPassModel),
    ];
};
