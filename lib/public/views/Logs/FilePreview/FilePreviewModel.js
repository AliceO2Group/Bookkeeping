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

import { Observable } from '/js/src/index.js';

/**
 * Model for the file preview functionality
 */
export class FilePreviewModel extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._attachmentPreviews = {};
    }

    /**
     * Converts the given url to a previewable blob
     *
     * @param {string} downloadLink the url needed to create a blob
     * @returns {Blob} the blob to preview
     */
    async fetchAttachmentPreview(downloadLink) {
        const response = await fetch(downloadLink);
        return await response.blob();
    }

    /**
     * Returns the data for the file preview
     *
     * @param {string} fileName the name of the file you want a preview of
     * @returns {string|vnode|object} the data for the preview
     */
    getAttachmentPreview(fileName) {
        return this._attachmentPreviews[fileName];
    }

    /**
     * Stores the new file preview data if the file name does not already have preview data
     *
     * @param {string|vnode|object} preview the file preview data
     * @param {string} fileName the name of the file for the preview
     * @returns {void}
     */
    setAttachmentPreview(preview, fileName) {
        if (!this._attachmentPreviews[fileName]) {
            this._attachmentPreviews[fileName] = preview;
            this.notify();
        }
    }
}
