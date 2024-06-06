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

import { runDetailsComponent } from './runDetailsComponent.js';
import { quickAccessService } from '../../../services/quickAccessService.js';

/**
 * A collection of fields to show per Run detail, optionally with special formatting
 *
 * @param {Model} model Pass the model to access the defined functions.
 * @return {Component} The display view of a given run
 */
export const RunDetailsPage = (model) => {
    if (!model.router.params.id && !model.router.params.runNumber) {
        model.router.go('?page=run-overview');
        return null;
    }

    quickAccessService.push('Runs', model.router.params.runNumber, model.router.getUrl().href);

    return runDetailsComponent(model.runs.detailsModel, model.router);
};
