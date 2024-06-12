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

import { Loader, Observable, QueryRouter, sessionService } from '/js/src/index.js';

import { LogsModel } from './views/Logs/LogsModel.js';
import Tags from './views/Tags/Tags.js';
import { RunsModel } from './views/Runs/RunsModel.js';
import Subsystems from './views/Subsystems/Subsystems.js';
import Flps from './views/Flps/Flps.js';
import { EnvironmentModel } from './views/Environments/EnvironmentModel.js';
import LhcFills from './views/LhcFills/LhcFills.js';
import RunTypeModel from './views/RunTypes/RunTypeModel.js';
import { ModalModel } from './components/modal/ModalModel.js';
import { debounce, INPUT_DEBOUNCE_TIME } from './utilities/debounce.js';
import { userPreferencesStore } from './utilities/userPreferencesStore.js';
import { registerFrontLinkListener } from './components/common/navigation/frontLinkListener.js';
import { EosReportModel } from './views/EosReport/EosReportModel.js';
import { AboutModel } from './views/About/About.js';
import { StatisticsPageModel } from './views/Statistics/StatisticsPageModel.js';
import { LhcPeriodsModel } from './views/lhcPeriods/LhcPeriodsModel.js';
import { HomePageModel } from './views/Home/Overview/HomePageModel.js';
import { DataPassesModel } from './views/DataPasses/DataPassesModel.js';
import { SimulationPassesModel } from './views/SimulationPasses/SimulationPassesModel.js';
import { QcFlagTypesModel } from './views/QcFlagTypes/QcFlagTypesModel.js';
import { QcFlagsModel } from './views/QcFlags/QcFlagsModel.js';
import { UserRoleSelectionModel } from './models/UserRoleSelectionModel.js';
import { ObservableData } from './utilities/ObservableData.js';
import { dplDetectorsProvider } from './services/detectors/dplDetectorsProvider.js';
import { BkpRoles } from './domain/enums/BkpRoles.js';
import { getRoleForDetector } from './utilities/getRoleForDetector.js';

/**
 * Root of model tree
 * Handle global events: keyboard, websocket and router location change
 */
export default class Model extends Observable {
    /**
     * Load all sub-models and bind event handlers
     * @param {Object} window The window object from the HTML
     * @param {Object} document The document object
     */
    constructor(window, document) {
        super();
        // Bind window and document
        this.document = document;
        this.window = window;

        // Bind session
        this.session = sessionService.get();
        this.session.personid = parseInt(this.session.personid, 10);

        this.userRoleSelectionModel = new UserRoleSelectionModel();
        if (this.session.personid === 0) { // Anonymous user has id 0
            this.userRoleSelectionModel.observe(() => {
                this.session.access = this.userRoleSelectionModel.selected;
                this.notify();
            });
        }

        // Bind user preferences
        userPreferencesStore.bubbleTo(this);

        this._dplDetectorsUserHasAccessTo = ObservableData.builder()
            .source(dplDetectorsProvider.physical$)
            .apply((remoteDetectors) => remoteDetectors.apply({
                Success: (detectors) => {
                    const { access = [] } = this.session;
                    return access.includes(BkpRoles.ADMIN)
                        ? detectors
                        : detectors.filter(({ name }) => access.includes(getRoleForDetector(name)));
                },
            }))
            .build();
        this.userRoleSelectionModel.observe(() => this._dplDetectorsUserHasAccessTo.setCurrent(dplDetectorsProvider.physical$.getCurrent()));

        // Bind models
        this.loader = new Loader(this);
        this.loader.bubbleTo(this);

        this.modalModel = new ModalModel();
        this.modalModel.bubbleTo(this);

        // App's configuration
        this._appConfiguration$ = new Observable();
        this._inputDebounceTime = INPUT_DEBOUNCE_TIME;

        // Models

        this.home = new HomePageModel(this);
        this.home.bubbleTo(this);

        this.lhcPeriods = new LhcPeriodsModel(this);
        this.lhcPeriods.bubbleTo(this);

        this.dataPasses = new DataPassesModel(this);
        this.dataPasses.bubbleTo(this);

        this.qcFlags = new QcFlagsModel(this);
        this.qcFlags.bubbleTo(this);

        this.simulationPasses = new SimulationPassesModel(this);
        this.simulationPasses.bubbleTo(this);

        this.qcFlagTypes = new QcFlagTypesModel(this);
        this.qcFlagTypes.bubbleTo(this);

        /**
         * @type {LogsModel}
         */
        this.logs = new LogsModel(this);
        this.logs.bubbleTo(this);

        /**
         * @type {EnvironmentModel}
         */
        this.envs = new EnvironmentModel(this);
        this.envs.bubbleTo(this);

        /**
         * @type {LhcFills}
         */
        this.lhcFills = new LhcFills(this);
        this.lhcFills.bubbleTo(this);

        this.runs = new RunsModel(this);
        this.runs.bubbleTo(this);

        this.subsystems = new Subsystems(this);
        this.subsystems.bubbleTo(this);

        this.statisticsModel = new StatisticsPageModel();
        this.statisticsModel.bubbleTo(this);

        /**
         * @type {TagModel}
         */
        this.tags = new Tags(this);
        this.tags.bubbleTo(this);

        /**
         * @type {Flps}
         */
        this.flps = new Flps(this);
        this.flps.bubbleTo(this);

        /**
         * @type {RunTypeModel}
         */
        this.runTypes = new RunTypeModel();
        this.runTypes.bubbleTo(this);

        /**
         * @type {EosReportModel}
         */
        this.eosReportModel = new EosReportModel(this);
        this.eosReportModel.bubbleTo(this);

        /**
         * @type {AboutModel}
         */
        this.aboutModel = new AboutModel();
        this.aboutModel.bubbleTo(this);

        // Setup router
        this.router = new QueryRouter();
        this.router.observe(this.handleLocationChange.bind(this));
        this.router.bubbleTo(this);
        registerFrontLinkListener((e) => this.router.handleLinkEvent(e));

        // Init pages
        this.handleLocationChange();
        this.window.addEventListener('resize', debounce(() => this.notify(), 100));

        // Navbar dropdown menus
        this.dropdownMenu = false;
    }

    /**
     * Delegates sub-model actions depending on new location of the page
     * @returns {vnode} The page to be loaded
     */
    async handleLocationChange() {
        // Reset infinite scroll to prevent scroll listening on pages where it is disabled or not needed
        window.onscroll = null;

        switch (this.router.params.page) {
            case 'home':
                // Setting the rows per page also collects all the runs and logs
                this.home.loadOverview();
                break;
            case 'lhc-period-overview':
                this.lhcPeriods.loadOverview();
                break;
            case 'data-passes-per-simulation-pass-overview':
                this.dataPasses.loadPerSimulationPassOverview(this.router.params);
                break;
            case 'data-passes-per-lhc-period-overview':
                this.dataPasses.loadPerLhcPeriodOverview(this.router.params);
                break;
            case 'simulation-passes-per-lhc-period-overview':
                this.simulationPasses.loadPerLhcPeriodOverview(this.router.params);
                break;
            case 'qc-flag-types-overview':
                this.qcFlagTypes.loadOverview();
                break;
            case 'qc-flag-type-creation':
                this.qcFlagTypes.loadCreation();
                break;
            case 'qc-flags-for-data-pass':
                this.qcFlags.loadForDataPassOverview(this.router.params);
                break;
            case 'qc-flag-creation-for-data-pass':
                this.qcFlags.loadCreationForDataPass(this.router.params);
                break;
            case 'qc-flags-for-simulation-pass':
                this.qcFlags.loadForSimulationPassOverview(this.router.params);
                break;
            case 'qc-flag-details-for-data-pass':
                this.qcFlags.loadDetailsForDataPass(this.router.params);
                break;
            case 'qc-flag-details-for-simulation-pass':
                this.qcFlags.loadDetailsForSimulationPass(this.router.params);
                break;
            case 'qc-flag-creation-for-simulation-pass':
                this.qcFlags.loadCreationForSimulationPass(this.router.params);
                break;
            case 'anchored-simulation-passes-overview':
                this.simulationPasses.loadAnchoredOverview(this.router.params);
                break;
            case 'env-overview':
                this.envs.loadOverview();
                break;
            case 'env-details':
                this.envs.loadDetails(this.router.params);
                break;
            case 'lhc-fill-overview':
                this.lhcFills.loadOverview();
                break;
            case 'lhc-fill-details':
                this.lhcFills.loadDetails(this.router.params);
                break;
            case 'log-overview':
                // Prevent loading extra rows when it's not necessary
                this.logs.loadOverview();
                break;
            case 'log-detail':
                this.logs.loadTreeView(this.router.params.id);
                break;
            case 'log-create':
                this.logs.loadCreation(this.router.params);
                break;
            case 'log-reply':
                this.logs.loadReply(this.router.params);
                break;
            case 'run-overview':
                this.runs.loadOverview();
                break;
            case 'runs-per-lhc-period':
                this.runs.loadPerLhcPeriodOverview(this.router.params);
                break;
            case 'runs-per-data-pass':
                this.runs.loadPerDataPassOverview(this.router.params);
                break;
            case 'runs-per-simulation-pass':
                this.runs.loadPerSimulationPassOverview(this.router.params);
                break;
            case 'run-detail':
                this.runs.loadDetails(this.router.params);
                break;
            case 'statistics':
                this.statisticsModel.load(this.router.params);
                break;
            case 'tag-overview':
                break;
            case 'tag-detail':
                await this.tags.loadDetails(parseInt(this.router.params.id, 10), this.router.params.panel);
                break;
            case 'tag-create':
                break;
            case 'subsystem-overview':
                this.subsystems.fetchAllSubsystems();
                break;
            case 'subsystem-detail':
                if (this.router.params.panel) {
                    this.subsystems.fetchOneSubsystem(this.router.params.id);
                    switch (this.router.params.panel) {
                        case 'logs':
                            this.subsystems.fetchLogsOfSubsystem(this.router.params.id);
                            break;
                        default:
                            break;
                    }
                }
                break;
            case 'create-tag':
                break;
            case 'flp-overview':
                // Prevent loading extra rows when it's not necessary
                if (!this.flps.pagination.isInfiniteScrollEnabled) {
                    this.flps.fetchAllFlps();
                }
                break;
            case 'flp-detail':
                if (this.router.params.panel) {
                    this.flps.fetchOneFlp(this.router.params.id);
                }
                break;
            case 'about-overview':
                this.aboutModel.fetchAllServiceInfo();
                break;
            case 'eos-report-create':
                this.eosReportModel.loadCreation(this.router.params.shiftType);
                break;
            default:
                this.router.go('?page=home');
                break;
        }
    }

    /**
     * Toggle navbar dropdown
     * @param {string} key referencing dropdown to be toggled
     * @returns {void}
     */
    toggleDropdownMenu(key) {
        this.dropdownMenu = this.dropdownMenu === key ? null : key;
        this.notify();
    }

    /**
     * Clears all navbar dropdowns
     * @returns {void}
     */
    clearDropdownMenu() {
        this.dropdownMenu = null;
        this.notify();
    }

    /**
     * To decided whether dropdown (referenced by the key) should be displayed as opened
     * @param {string} key referencing dropdown
     * @returns {boolean} if true dropdown should be opened
     */
    isDropdownMenuOpened(key) {
        return this.dropdownMenu === key;
    }

    /**
     * Checks if the user is an admin user.
     * @returns {boolean} If the user has the admin role
     */
    isAdmin() {
        return this.session.access.includes('admin');
    }

    /**
     * Returns an observable notified once the app's configuration is modified
     */
    get appConfiguration$() {
        return this._appConfiguration$;
    }

    /**
     * Disable input debounce for the whole application
     * This is a test-purposed feature, it should not be used in actual browser
     *
     * @returns {void}
     */
    disableInputDebounce() {
        this._inputDebounceTime = 0;
        this._appConfiguration$.notify();
    }

    /**
     * Return the debounce time that should be applied to user inputs when it makes sense, such as text, number, ranage input
     *
     * @returns {number} the debounce time
     */
    get inputDebounceTime() {
        return this._inputDebounceTime;
    }

    /**
     * Get dpl detector which user can manage QC flags for
     *
     * @return {RemoteData<DplDetector[]>} dpl detectors remote data
     */
    get dplDetectorsUserHasAccessTo() {
        return this._dplDetectorsUserHasAccessTo.getCurrent();
    }
}
