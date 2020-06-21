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

/**
 * Root of model tree
 * Handle global events: keyboard, websocket and router location change
 */
export default class Model extends Observable {
    /**
     * Load all sub-models and bind event handlers
     * @param {Object} HyperMD The hyperMD object passed from HTML code
     * @param {Object} CompleteEmoji The CompleteEmoji object passed from HTML code
     */
    constructor(HyperMD, CompleteEmoji) {
        super();
        // Bind HyperMD
        this.HyperMD = HyperMD;
        this.CompleteEmoji = CompleteEmoji;

        this.session = sessionService.get();
        this.session.personid = parseInt(this.session.personid, 10);

        this.accountMenuEnabled = false;

        // Bind Models
        this.loader = new Loader(this);
        this.loader.bubbleTo(this);

        this.logs = new Logs(this);
        this.logs.bubbleTo(this);

        this.tags = new Tags(this);
        this.tags.bubbleTo(this);

        // Setup router
        this.router = new QueryRouter();
        this.router.observe(this.handleLocationChange.bind(this));
        this.router.bubbleTo(this);

        this.handleLocationChange(); // Init first page
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
