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
import { LogCreationPage } from './views/Logs/Create/LogCreationPage.js';
import RunsOverview from './views/Runs/Overview/index.js';
import { RunDetailsPage } from './views/Runs/Details/RunDetailsPage.js';
import SubsystemOverview from './views/Subsystems/Overview/index.js';
import SubsystemDetail from './views/Subsystems/Details/index.js';
import TagsOverview from './views/Tags/Overview/index.js';
import TagCreate from './views/Tags/Create/index.js';
import FlpOverview from './views/Flps/Overview/index.js';
import AboutOverview from './views/About/Overview/index.js';
import FlpDetail from './views/Flps/Details/index.js';
import HomeOverview from './views/Home/Overview/index.js';
import { EnvironmentOverviewPage } from './views/Environments/Overview/EnvironmentOverviewPage.js';
import { Index } from './views/LhcFills/Overview/index.js';
import { modalContainer } from './components/modal/modalContainer.js';
import { LhcFillDetailsPage } from './views/LhcFills/Detail/LhcFillDetailsPage.js';
import { taggedEventRegistry } from './utilities/taggedEventRegistry.js';
import { EnvironmentDetailsPage } from './views/Environments/Details/EnvironmentDetailsPage.js';
import { LogTreeViewPage } from './views/Logs/Details/LogTreeViewPage.js';
import { TagDetailsPage } from './views/Tags/Details/TagDetailsPage.js';
import { EosReportCreationPage } from './views/EosReport/create/EosReportCreationPage.js';
import { StatisticsPage } from './views/Statistics/StatisticsPage.js';

/**
 * Main view layout
 * @param {Model} model - representing current application state
 * @return {vnode} application view to be drawn according to model
 */
export default (model) => {
    const pages = {
        home: HomeOverview,

        'log-overview': LogsOverview,
        'log-detail': LogTreeViewPage,
        'log-create': LogCreationPage,

        'env-overview': EnvironmentOverviewPage,
        'env-details': EnvironmentDetailsPage,

        'lhc-fill-overview': Index,
        'lhc-fill-details': LhcFillDetailsPage,

        'run-overview': RunsOverview,
        'run-detail': RunDetailsPage,

        statistics: StatisticsPage,

        'flp-overview': FlpOverview,
        'flp-detail': FlpDetail,

        'about-overview': AboutOverview,

        'tag-overview': TagsOverview,
        'tag-detail': TagDetailsPage,
        'tag-create': TagCreate,

        'subsystem-overview': SubsystemOverview,
        'subsystem-detail': SubsystemDetail,

        'eos-report-create': EosReportCreationPage,
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
 * @param {Model} model Pass the model object to the child
 * @param {Object} pages Pass the pages to the switchcase
 * @returns {vnode} Returns a vnode to render the pages
 */
const content = (model, pages) => h(
    '#global-container',
    h(
        '.flex-column',
        {
            key: model.router.params.page,
            style: 'min-height: 100%',
            onupdate: () => {
            },
        },
        switchCase(model.router.params.page, pages)(model),
    ),
);
