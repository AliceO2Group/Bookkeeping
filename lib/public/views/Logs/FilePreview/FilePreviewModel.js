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

import { h, Observable, RemoteData } from '/js/src/index.js';

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
     * @returns {RemoteData} the data for the preview
     */
    getAttachmentPreview(fileName) {
        if (!this._attachmentPreviews[fileName]) {
            return RemoteData.notAsked();
        }
        return this._attachmentPreviews[fileName];
    }

    /**
     * Stores the new file preview data if the file name does not already have preview data
     *
     * @param {RemoteData} preview the file preview data
     * @param {string|undefined} fileName the name of the file for the preview
     * @returns {void}
     */
    setAttachmentPreview(preview, fileName = undefined) {
        if (this.getAttachmentPreview(fileName).isNotAsked()) {
            this._attachmentPreviews[fileName] = preview;
            this.notify();
        }
    }

    /**
     * Checks if the file is a blob or not, and prepares the file to show
     *
     * @param {Method} awaitMethod actions to take after onload, or fetching
     * @param {Method} readMethod reader method to execute (readAsText, readAsDataUrl, ...)
     * @param {string|undefined} url the file preview url if defined
     * @param {Blob|string} attachment the attachment to read
     * @returns {void}
     */
    readFile(awaitMethod, readMethod, url, attachment = undefined) {
        try {
            this.setAttachmentPreview(RemoteData.loading());
            if (!url) {
                const reader = new FileReader();
                reader.onload = () => awaitMethod(reader.result);
                readMethod(attachment, reader);
            } else {
                this.fetchAttachmentPreview(url)
                    .then((blob) => {
                        const reader = new FileReader();
                        reader.onload = () => awaitMethod(reader.result);
                        readMethod(blob, reader);
                    });
            }
        } catch (error) {
            this.setAttachmentPreview(RemoteData.failure(error));
        }
    }

    /**
     * List of methods for handling each file preview
     *
     * @returns {Object} an object of methods that handle each file type
     */
    handleFileType() {
        return {

            /**
             * Handles image file types to preview
             *
             * @param {Blob|string} attachment the image to preview
             * @param {string|undefined} url the url of the image, if defined
             * @returns {void}
             */
            image: (attachment, url) => {
                this.readFile(
                    (data) => this.setAttachmentPreview(RemoteData.success(data), attachment.name),
                    (data, reader) => reader.readAsDataURL(data),
                    url,
                    attachment,
                );
            },

            /**
             * Handles csv file types to preview
             *
             * @param {Blob|string} attachment the csv file to preview
             * @param {string|undefined} url the url of the csv file, if defined
             * @returns {void}
             */
            csv: (attachment, url) => {
                this.readFile(
                    (data) => {
                        let content;
                        const lines = data.split('\n');
                        if (lines.length < 2) {
                            content = h('div', 'Invalid CSV format');
                        } else {
                            const headers = lines[0].split(',');
                            const headerRow = h('tr', headers.map((header, index) => h('th', {
                                key: index,
                            }, header)));

                            const tableRows = lines.slice(1).map((line, rowIndex) => {
                                const columns = line.split(',');
                                return h('tr', { key: rowIndex }, columns.map((column, colIndex) => h('td', { key: colIndex }, column)));
                            });

                            content = [
                                h('thead', { key: 'thead' }, headerRow),
                                h('tbody', { key: 'tbody' }, tableRows),
                            ];
                        }

                        this.setAttachmentPreview(RemoteData.success(content), attachment.name);
                    },
                    (data, reader) => reader.readAsText(data),
                    url,
                    attachment,
                );
            },

            /**
             * Handles json file types to preview
             *
             * @param {Blob|string} attachment the json file to preview
             * @param {string|undefined} url the url of the json file, if defined
             * @returns {void}
             */
            json: (attachment, url) => {
                this.readFile(
                    (data) => {
                        const jsonContent = JSON.parse(data);
                        this.setAttachmentPreview(RemoteData.success(JSON.stringify(jsonContent, null, 2)), attachment.name);
                    },
                    (data, reader) => reader.readAsText(data),
                    url,
                    attachment,
                );
            },

            /**
             * Handles text file types to preview
             *
             * @param {Blob|string} attachment the text file to preview
             * @param {string|undefined} url the url of the text file, if defined
             * @returns {void}
             */
            text: (attachment, url) => {
                this.readFile(
                    (data) => this.setAttachmentPreview(RemoteData.success(data), attachment.name),
                    (data, reader) => reader.readAsText(data),
                    url,
                    attachment,
                );
            },
        };
    }
}
