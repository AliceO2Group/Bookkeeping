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
import { logCreationComponent } from './logCreationComponent.js';
import errorAlert from '../../../components/common/errorAlert.js';

/**
 * Page displaying the form to create a new log
 *
 * @param {Model} model the global model
 * @return {Component} the creation page
 */
export const LogCreationPage = (model) => {
    const { creationModel } = model.logs;

    if (!creationModel) {
        return errorAlert({
            title: 'Incoherent state',
            detail: 'The page internal state is broken, please try to refresh the page',
        });
    }

    return logCreationComponent(model.logs.creationModel);
};
