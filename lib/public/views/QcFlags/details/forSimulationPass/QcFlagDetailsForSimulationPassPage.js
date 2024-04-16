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

import errorAlert from '../../../../components/common/errorAlert.js';
import { deleteButton } from '../../../../components/common/form/deleteButton.js';
import spinner from '../../../../components/common/spinner.js';
import { qcFlagDetailsComponent } from '../qcFlagDeailsComponent.js';
import { h } from '/js/src/index.js';

/**
 * Render QC flag details for data pass page
 *
 * @param {Model} model The overall model object.
 * @returns {Component} The details page
 */
export const QcFlagDetailsForSimulationPassPage = ({ qcFlags: { detailsForSimulationPassModel, forSimulationPassOverviewModel } }) => h('', {
    onremove: () => {
        forSimulationPassOverviewModel.reset();
    },
}, [
    h('.flex-row.justify-between.items-center', [
        h('h2', 'QC Flag Details'),
        h('.pv3', detailsForSimulationPassModel.deleteResult.match({
            Loading: () => deleteButton(null, 'Processing...'),
            Success: () => deleteButton(null, 'Processed!'),
            Failure: () => deleteButton(() => detailsForSimulationPassModel.delete()),
            NotAsked: () => deleteButton(() => detailsForSimulationPassModel.delete()),
        })),
    ]),
    detailsForSimulationPassModel.qcFlag.match({
        Success: () => h('.flex-row.g3.flex-grow', [qcFlagDetailsComponent(detailsForSimulationPassModel)]),
        Loading: () => spinner(),
        NotAsked: () => errorAlert([{ title: 'No data', detail: 'No QC flag data was asked for' }]),
        Failure: (errors) => errorAlert(errors),
    }),
]);
