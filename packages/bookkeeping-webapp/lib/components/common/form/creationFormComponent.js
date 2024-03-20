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
import errorAlert from '../errorAlert.js';
import { createButton } from './createButton.js';
import { h } from '/js/src/index.js';

/**
 * Wrapp a given form inputs in a form component, with errors at the top and submit button
 *
 * @param {CreationModel} creationFormModel the form model
 * @param {Component} formInputsComponent the component containing all the form inputs
 * @return {Component} the form component
 */
export const creationFormComponent = (creationFormModel, formInputsComponent) => [
    creationFormModel.creationResult.isFailure() && errorAlert(creationFormModel.creationResult.payload),
    formInputsComponent,
    h('.pv3', creationFormModel.creationResult.match({
        Loading: () => createButton(null, 'Sending...'),
        Success: () => createButton(null, 'Sent!'),
        Failure: () => createButton(creationFormModel.isValid() ? () => creationFormModel.submit() : null),
        NotAsked: () => createButton(creationFormModel.isValid() ? () => creationFormModel.submit() : null),
    })),
];
