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
import { logTreeViewComponent } from './logTreeViewComponent.js';

/**
 * Component displaying the tree view for the currently selected log
 *
 * @param {Model} model the global model
 * @return {Component} the tree view component for the currently selected log
 */
export const LogTreeViewPage = (model) => logTreeViewComponent(model.logs.treeViewModel, model.session.token);
