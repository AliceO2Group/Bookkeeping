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

import { h } from '/js/src/index.js';
import { tagDetailsComponent } from './tagDetailsComponent.js';

/**
 * The VNode of the Tag Detail screen.
 *
 * @param {Model} model Pass the model to access the defined functions.
 * @return {vnode} The VNode of the Tag Detail screen.
 */
export const TagDetailsPage = (model) => h('', {
    onremove: () => model.tags.clearDetails(),
}, tagDetailsComponent(model.tags.detailsModel));
