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
import LogsOverview from './views/Logs/Overview/index.js';
import LogDetail from './views/Logs/Details/index.js';
import { LogCreationPage } from './views/Logs/Create/LogCreationPage.js';
import RunsOverview from './views/Runs/Overview/index.js';
import RunDetail from './views/Runs/Details/index.js';
import SubsystemOverview from './views/Subsystems/Overview/index.js';
import SubsystemDetail from './views/Subsystems/Details/index.js';
import TagsOverview from './views/Tags/Overview/index.js';
import TagDetail from './views/Tags/Details/index.js';
import TagCreate from './views/Tags/Create/index.js';
import FlpOverview from './views/Flps/Overview/index.js';
import AboutOverview from './views/About/Overview/index.js';
import FlpDetail from './views/Flps/Details/index.js';
import HomeOverview from './views/Home/Overview/index.js';
import EnvOverview from './views/Envs/Overview/index.js';
import { Index } from './views/LhcFills/Overview/index.js';
import { modalContainer } from './components/modal/modalContainer.js';
import { LhcFillDetailsPage } from './views/LhcFills/Detail/LhcFillDetailsPage.js';
import { taggedEventRegistry } from './utilities/taggedEventRegistry.js';

/**
 * Main view layout
 * @param {object} model - representing current application state
 * @return {vnode} application view to be drawn according to model
 */
export default (model) => {
    const pages = {
        home: HomeOverview,

        'log-overview': LogsOverview,
        'log-detail': LogDetail,
        'log-create': LogCreationPage,

        'env-overview': EnvOverview,

        'lhc-fill-overview': Index,
        'lhc-fill-details': LhcFillDetailsPage,

        'run-overview': RunsOverview,
        'run-detail': RunDetail,

        'flp-overview': FlpOverview,
        'flp-detail': FlpDetail,

        'about-overview': AboutOverview,

        'tag-overview': TagsOverview,
        'tag-detail': TagDetail,
        'tag-create': TagCreate,

        'subsystem-overview': SubsystemOverview,
        'subsystem-detail': SubsystemDetail,

    };

    return [
        h('.flex-column.absolute-fill', {
            onclick: (e) => taggedEventRegistry.flush(e),
        }, [
            modalContainer(model.modalModel),
            NavBar(model),
            content(model, pages),
        ]),
    ];
};

/**
 * Page content
 * @param {Object} model Pass the model object to the child
 * @param {Object} pages Pass the pages to the switchcase
 * @returns {vnode} Returns a vnode to render the pages
 */
const content = (model, pages) => h(
    '.p2',
    h(
        '',
        { key: model.router.params.page },
        switchCase(model.router.params.page, pages)(model),
    ),
);
