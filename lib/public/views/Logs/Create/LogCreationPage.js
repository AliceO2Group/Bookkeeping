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

/**
 * Page displaying the form to create a new log
 *
 * @param {Model} model the global model
 * @return {vnode} the creation page
 */
export const LogCreationPage = (model) => logCreationComponent(model.logs.creationModel, model.tags.getTags());
