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

import Logs from './views/Logs/Logs.js';
import Tags from './views/Tags/Tags.js';
import Runs from './views/Runs/Runs.js';
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
import AboutModel from './views/About/About.js';

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

        // Bind user preferences
        userPreferencesStore.bubbleTo(this);

        // Bind models
        this.loader = new Loader(this);
        this.loader.bubbleTo(this);

        this.modalModel = new ModalModel();
        this.modalModel.bubbleTo(this);

        // App's configuration
        this._appConfiguration$ = new Observable();
        this._inputDebounceTime = INPUT_DEBOUNCE_TIME;

        // Models

        /**
         * @type {LogModel}
         */
        this.logs = new Logs(this);
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

        /**
         * @type {RunModel}
         */
        this.runs = new Runs(this);
        this.runs.bubbleTo(this);

        this.subsystems = new Subsystems(this);
        this.subsystems.bubbleTo(this);

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
                this.logs.fetchAllLogs();
                this.runs.fetchAllRuns();
                break;
            case 'env-overview':
                this.envs.loadOverview();
                break;
            case 'env-details':
                this.envs.loadDetails(this.router.params.environmentId);
                break;
            case 'lhc-fill-overview':
                this.lhcFills.loadOverview();
                break;
            case 'lhc-fill-details':
                this.lhcFills.loadDetails(this.router.params.fillNumber);
                break;
            case 'log-overview':
                // Prevent loading extra rows when it's not necessary
                if (!this.logs.pagination.isInfiniteScrollEnabled) {
                    this.logs.fetchAllLogs();
                    this.runs.fetchAllRuns();
                }
                break;
            case 'log-detail':
                this.logs.loadTreeView(parseInt(this.router.params.id, 10));
                break;
            case 'log-create':
                this.logs.loadCreation(
                    this.router.params.id !== undefined ? this.router.params.id : '',
                    parseInt(this.router.params.parentLogId, 10) || null,
                );
                break;
            case 'run-overview':
                // Prevent loading extra rows when it's not necessary
                if (!this.runs.pagination.isInfiniteScrollEnabled) {
                    this.runs.fetchAllRuns();
                }
                break;
            case 'run-detail':
                this.runs.loadDetails(parseInt(this.router.params.id, 10), this.router.params.panel);

                if (this.router.params.panel) {
                    this.runs.detailsModel.clearAllEditors();
                }
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
     * Toggle navbar overview dropdown
     * @returns {undefined}
     */
    toggleOverviewDropdown() {
        this.dropdownMenu = this.dropdownMenu === 'overview' ? false : 'overview';
        this.notify();
    }

    /**
     * Toggle navbar account dropdown
     * @returns {undefined}
     */
    toggleAccountDropdown() {
        this.dropdownMenu = this.dropdownMenu === 'account' ? false : 'account';
        this.notify();
    }

    /**
     * Clears all navbar dropdowns
     * @returns {undefined}
     */
    clearDropdownMenu() {
        this.dropdownMenu = false;
        this.notify();
    }

    /**
     * Checks if the user is an admin user.
     * @returns {Boolean} If the user has the admin role
     */
    isAdmin() {
        return this.session.access.includes('admin');
    }

    /**
     * Display a modal on the screen
     * @see ModalModel
     *
     * @param {Modal} modal the modal to display
     *
     * @returns {void}
     */
    modal(modal) {
        this.modalModel.display(modal);
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
}
