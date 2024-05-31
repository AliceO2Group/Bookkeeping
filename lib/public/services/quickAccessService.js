/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

import { buildUrl } from '../utilities/fetch/buildUrl.js';

/**
 * Service to handle quick access stacks
 */
export class QuickAccessService {
    /**
     * Constructor
     */
    constructor() {
        /**
         * @type {Map<string, Map<string, string>>} list of stacks mapped by their name, values are map of tabs per stack mapped ty their name
         * @private
         */
        this._stacks = new Map();

        /**
         * @type {Map<string, Map<string, string>>} map between every URL and the stack that contains it
         * @private
         */
        this._urlsToStack = new Map();
    }

    /**
     * Push a new tab in given quick access stack
     *
     * @param {string} stackName the name of the quick access stack in which a tab must be added
     * @param {string} tabName the name of the tab (if a tab already exist in the stack with this name, it will be overridden)
     * @param {string} url the url of the tab
     * @return {void}
     */
    push(stackName, tabName, url) {
        const normalizedUrl = buildUrl(url);

        /**
         * @type {Map<string, string>}
         */
        const stack = this._getStack(stackName);
        if (stack.size === 0) {
            this._stacks.set(stackName, stack);
        }
        stack.set(tabName, normalizedUrl);
        this._urlsToStack.set(normalizedUrl, stack);
    }

    /**
     * Return, if it applies, the stack containing the given URL
     *
     * @param {string} url the URL to look for containing stack
     * @return {Map<string, string>|null} the stack or null if none exists
     */
    getUrlStack(url) {
        return this._urlsToStack.get(buildUrl(url)) ?? null;
    }

    /**
     * Return the given stack (empty map if the stack is empty or does not exist)
     *
     * @param {string} stackName the name of the stack for which tabs should be returned
     * @return {Map<string, string>} the tabs url indexed by their name
     */
    _getStack(stackName) {
        return this._stacks.get(stackName) ?? new Map();
    }
}

export const quickAccessService = new QuickAccessService();
