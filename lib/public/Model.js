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

/**
 * Root of model tree
 * Handle global events: keyboard, websocket and router location change
 */
export default class Model extends Observable {
    /**
     * Load all sub-models and bind event handlers
     * @param {Object} HyperMD The hyperMD object passed from HTML code
     * @param {Object} window The window object from the HTML
     * @param {Object} document The document object
     * @param {Object} CompleteEmoji The CompleteEmoji object passed from HTML code
     */
    constructor(HyperMD, window, document, CompleteEmoji) {
        super();
        // Bind HyperMD, window and document
        this.HyperMD = HyperMD;
        this.document = document;
        this.window = window;
        this.CompleteEmoji = CompleteEmoji;

        // Bind session
        this.session = sessionService.get();
        this.session.personid = parseInt(this.session.personid, 10);

        // Bind models
        this.loader = new Loader(this);
        this.loader.bubbleTo(this);

        this.logs = new Logs(this);
        this.logs.bubbleTo(this);

        this.runs = new Runs(this);
        this.runs.bubbleTo(this);

        this.subsystems = new Subsystems(this);
        this.subsystems.bubbleTo(this);

        this.tags = new Tags(this);
        this.tags.bubbleTo(this);

        this.flps = new Flps(this);
        this.flps.bubbleTo(this);

        // Setup router
        this.router = new QueryRouter();
        this.router.observe(this.handleLocationChange.bind(this));
        this.router.bubbleTo(this);

        // Init pages
        this.handleLocationChange();
        this.window.addEventListener('resize', () => this.notify());

        // Navbar dropdown menus
        this.dropdownMenu = false;
    }

    /**
     * Delegates sub-model actions depending on new location of the page
     * @returns {vnode} The page to be loaded
     */
    async handleLocationChange() {
        switch (this.router.params.page) {
            case 'log-overview':
                this.logs.fetchAllLogs();
                this.tags.fetchAllTags();
                this.runs.fetchAllRuns();
                break;
            case 'log-detail':
                this.logs.fetchOneLog(this.router.params.id);
                break;
            case 'log-create':
                this.logs.setMarkdownBox('text', { location: 'logs', name: 'setText' });
                this.tags.fetchAllTags();
                break;
            case 'run-overview':
                this.runs.fetchAllRuns();
                break;
            case 'run-detail':
                if (this.router.params.panel) {
                    await this.runs.fetchOneRun(this.router.params.id);
                    await this.tags.fetchAllTags();
                    switch (this.router.params.panel) {
                        case 'logs':
                            await this.runs.fetchLogsOfRun(this.router.params.id);
                            break;
                        case 'flps':
                            await this.runs.fetchFlpsOfRun(this.router.params.id);
                            break;
                        default:
                            break;
                    }
                }
                break;
            case 'run-export':
                this.runs.fetchAllRuns();
                break;
            case 'tag-overview':
                this.tags.fetchAllTags();
                break;
            case 'tag-detail':
                if (this.router.params.panel) {
                    this.tags.fetchOneTag(this.router.params.id);
                    switch (this.router.params.panel) {
                        case 'logs':
                            this.tags.fetchLogsOfTag(this.router.params.id);
                            break;
                        default:
                            break;
                    }
                }
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
                this.flps.fetchAllFlps();
                break;
            case 'flp':
                if (this.router.params.panel) {
                    this.flps.fetchOneFlp(this.router.params.id);
                    switch (this.router.params.panel) {
                        case 'logs':
                            this.flps.fetchLogsOfFlp(this.router.params.id);
                            break;
                        default:
                            break;
                    }
                }
                break;
            case 'about-overview':
                break;
            default:
                this.router.go('?page=log-overview');
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
}
