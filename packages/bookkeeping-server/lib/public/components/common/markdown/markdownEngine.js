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

/**
 * Basic engine for markdown edition and visualization
 */
class MarkdownEngine {
    /**
     * Constructor
     */
    constructor() {
        this._hyperMd = null;
        this._completeEmoji = null;
    }

    /**
     * Specify the HyperMD instance to use
     *
     * @param {HyperMD} hyperMd the instance
     * @return {void}
     */
    useHyperMd(hyperMd) {
        this._hyperMd = hyperMd;
    }

    /**
     * Specify the CompleteEmoji instance to use
     *
     * @param {CompleteEmoji} completeEmoji the instance
     * @return {void}
     */
    useCompleteEmoji(completeEmoji) {
        this._completeEmoji = completeEmoji;
    }

    /**
     * Returns the HyperMD instance or null
     * @return {HyperMD|null} the instance
     */
    get hyperMD() {
        return this._hyperMd;
    }

    /**
     * Returns the CompleteEmoji instance or null
     * @return {CompleteEmoji|null} then instance
     */
    get completeEmoji() {
        return this._completeEmoji;
    }
}

export const markdownEngine = new MarkdownEngine();
