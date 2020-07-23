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

import {
    Observable,
    QueryRouter,
    Loader,
    sessionService,
} from '/js/src/index.js';

import Logs from './views/Logs/Logs.js';
import Tags from './views/Tags/Tags.js';
import Runs from './views/Runs/Runs.js';
import Subsystems from './views/Subsystems/Subsystems.js';

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

        this.session = sessionService.get();
        this.session.personid = parseInt(this.session.personid, 10);

        this.accountMenuEnabled = false;

        // Bind Models
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

        // Setup router
        this.router = new QueryRouter();
        this.router.observe(this.handleLocationChange.bind(this));
        this.router.bubbleTo(this);

        this.handleLocationChange(); // Init first page
        this.window.addEventListener('resize', () => this.notify());
    }

    /**
     * Delegates sub-model actions depending on new location of the page
     * @returns {vnode} The page to be loaded
     */
    handleLocationChange() {
        switch (this.router.params.page) {
            case 'home':
                this.logs.fetchAllLogs();
                break;
            case 'entry':
                this.logs.fetchOneLog(this.router.params.id);
                break;
            case 'create-log-entry':
                this.logs.setMarkdownBox('text', { location: 'logs', name: 'setText' });
                break;
            case 'run' :
                if (this.router.params.panel) {
                    this.runs.fetchOneRun(this.router.params.id);
                }
                break;
            case 'run-overview':
                this.runs.fetchAllRuns();
                break;
            case 'subsystem' :
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
            case 'subsystem-overview':
                this.subsystems.fetchAllSubsystems();
                break;
            case 'tag':
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
            case 'tag-overview':
                this.tags.fetchAllTags();
                break;
            default:
                this.router.go('?page=home');
                break;
        }
    }

    /**
     * Toggle account menu dropdown
     * @returns {vnode} The page to be loaded
     */
    toggleAccountMenu() {
        this.accountMenuEnabled = !this.accountMenuEnabled;
        this.notify();
    }
}
