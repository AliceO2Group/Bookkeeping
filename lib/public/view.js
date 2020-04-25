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

import { h, switchCase } from '/js/src/index.js';
import NavBar from './components/NavBar/index.js';
import GeneralOverview from './views/Overview/General/page.js';
import DetailsView from './views/Overview/Details/page.js';

/**
 * Main view layout
 * @param {object} model - representing current application state
 * @return {vnode} application view to be drawn according to model
 */
export default (model) => {
    const navigationPages = {
        home: GeneralOverview,
    };

    const subPages = {
        entry: DetailsView,
    };

    return [
        h('.flex-column.absolute-fill', [
            NavBar(model, navigationPages),
            content(model, { ...navigationPages, ...subPages }),
        ]),
    ];
};

/**
 * Page content
 * @param {Object} model Pass the model object to the child
 * @param {Object} pages Pass the pages to the switchcase
 * @returns {vnode} Returns a vnode to render the pages
 */
const content = (model, pages) =>
    h('.p4', switchCase(model.router.params.page, pages)(model));
