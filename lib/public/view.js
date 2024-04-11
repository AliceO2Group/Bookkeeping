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
import { RunsOverviewPage } from './views/Runs/Overview/RunsOverviewPage.js';
import { RunDetailsPage } from './views/Runs/Details/RunDetailsPage.js';
import SubsystemOverview from './views/Subsystems/Overview/index.js';
import SubsystemDetail from './views/Subsystems/Details/index.js';
import TagsOverview from './views/Tags/Overview/index.js';
import TagCreate from './views/Tags/Create/index.js';
import FlpOverview from './views/Flps/Overview/index.js';
import AboutOverview from './views/About/Overview/index.js';
import FlpDetail from './views/Flps/Details/index.js';
import { EnvironmentOverviewPage } from './views/Environments/Overview/EnvironmentOverviewPage.js';
import { Index } from './views/LhcFills/Overview/index.js';
import { modalContainer } from './components/modal/modalContainer.js';
import { LhcFillDetailsPage } from './views/LhcFills/Detail/LhcFillDetailsPage.js';
import { EnvironmentDetailsPage } from './views/Environments/Details/EnvironmentDetailsPage.js';
import { LogTreeViewPage } from './views/Logs/Details/LogTreeViewPage.js';
import { TagDetailsPage } from './views/Tags/Details/TagDetailsPage.js';
import { EosReportCreationPage } from './views/EosReport/create/EosReportCreationPage.js';
import { StatisticsPage } from './views/Statistics/StatisticsPage.js';
import { LhcPeriodsOverviewPage } from './views/lhcPeriods/Overview/LhcPeriodsOverviewPage.js';
import { RunsPerLhcPeriodOverviewPage } from './views/Runs/RunPerPeriod/RunsPerLhcPeriodOverviewPage.js';
import { HomePage } from './views/Home/Overview/HomePage.js';
import { DataPassesPerLhcPeriodOverviewPage } from './views/DataPasses/PerLhcPeriodOverview/DataPassesPerLhcPeriodOverviewView.js';
import { SimulationPassesPerLhcPeriodOverviewPage }
    from './views/SimulationPasses/PerLhcPeriodOverview/SimulationPassesPerLhcPeriodOverviewPage.js';
import { DataPassesPerSimulationPassOverviewPage }
    from './views/DataPasses/PerSimulationPassOverview/DataPassesPerSimulationPassOverviewPage.js';
import { AnchoredSimulationPassessOverviewPage } from './views/SimulationPasses/AnchoredOverview/AnchoredSimulationPassesOverviewPage.js';
import { RunsPerDataPassOverviewPage } from './views/Runs/RunPerDataPass/RunsPerDataPassOverviewPage.js';
import { LogReplyPage } from './views/Logs/Create/LogReplyPage.js';
import { QcFlagTypeCreationPage } from './views/QcFlagTypes/Create/QcFlagTypeCreationPage.js';
import { RunsPerSimulationPassOverviewPage } from './views/Runs/RunsPerSimulationPass/RunsPerSimulationPassOverviewPage.js';
import { QcFlagTypesOverviewPage } from './views/QcFlagTypes/Overview/QcFlagTypesOverviewPage.js';
import { QcFlagsForDataPassOverviewPage } from './views/QcFlags/ForDataPass/QcFlagsForDataPassOverviewPage.js';
import { QcFlagsForSimulationPassOverviewPage } from './views/QcFlags/ForSimulationPass/QcFlagsForSimulationPassOverviewPage.js';
import { QcFlagsForDataPassCreationPage } from './views/QcFlags/Create/ForDataPass/QcFlagForDataPassCreationPage.js';

/**
 * Main view layout
 * @param {Model} model - representing current application state
 * @return {vnode} application view to be drawn according to model
 */
export default (model) => {
    const pages = {
        home: HomePage,

        'lhc-period-overview': LhcPeriodsOverviewPage,

        'data-passes-per-lhc-period-overview': DataPassesPerLhcPeriodOverviewPage,
        'data-passes-per-simulation-pass-overview': DataPassesPerSimulationPassOverviewPage,
        'simulation-passes-per-lhc-period-overview': SimulationPassesPerLhcPeriodOverviewPage,
        'anchored-simulation-passes-overview': AnchoredSimulationPassessOverviewPage,

        'log-overview': LogsOverview,
        'log-detail': LogTreeViewPage,
        'log-create': LogCreationPage,
        'log-reply': LogReplyPage,

        'env-overview': EnvironmentOverviewPage,
        'env-details': EnvironmentDetailsPage,

        'lhc-fill-overview': Index,
        'lhc-fill-details': LhcFillDetailsPage,

        'run-overview': RunsOverviewPage,
        'run-detail': RunDetailsPage,
        'runs-per-lhc-period': RunsPerLhcPeriodOverviewPage,
        'runs-per-data-pass': RunsPerDataPassOverviewPage,
        'runs-per-simulation-pass': RunsPerSimulationPassOverviewPage,

        'qc-flag-type-creation': QcFlagTypeCreationPage,
        'qc-flag-types-overview': QcFlagTypesOverviewPage,

        'qc-flags-for-data-pass': QcFlagsForDataPassOverviewPage,
        'qc-flags-for-simulation-pass': QcFlagsForSimulationPassOverviewPage,

        'qc-flag-creation-for-data-pass': QcFlagsForDataPassCreationPage,

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
        h('.flex-column.absolute-fill', [
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
