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

import { StatefulComponent } from '../../../components/common/StatefulComponent.js';
import spinner from '../../../components/common/spinner.js';
import errorAlert from '../../../components/common/errorAlert.js';
import { h, RemoteData } from '/js/src/index.js';

/**
 * Base class of file display
 */
class FileDisplayComponent extends StatefulComponent {
    /**
     * Constructor
     *
     * @param {Blob|File} file the file or blob to display
     * @param {string} fileName the display name of the file
     * @return {Component} the resulting component
     */
    oninit({ attrs: { file, fileName } }) {
        this._fileName = fileName;

        /**
         * @type {RemoteData<string, ApiError>}
         * @private
         */
        this._remoteFileReadResult = RemoteData.loading();
        const reader = new FileReader();
        reader.addEventListener(
            'load',
            () => this._setRemoteFileReadResult(RemoteData.success(reader.result)),
            { once: true },
        );
        reader.addEventListener(
            'error',
            () => this._setRemoteFileReadResult(RemoteData.failure({
                title: 'File failed to load',
                detail: reader.error.message,
            })),
            { once: true },
        );
        this._read(reader, file);
    }

    /**
     * Renders the file display
     *
     * @return {Component} the resulting component
     */
    view() {
        return this._remoteFileReadResult.match({
            NotAsked: () => null,
            Loading: () => spinner({ absolute: false, size: 3 }),
            Success: (fileReadResult) => this._successComponent(fileReadResult),
            Failure: () => (errors) => errorAlert(errors),
        });
    }

    /**
     * Read the file using the given reader
     *
     * @param {FileReader} reader the file reader to use
     * @param {File|Blob} file the file to read
     * @return {void}
     */
    _read(reader, file) { // eslint-disable-line no-unused-vars
        throw new Error('Abstract function call');
    }

    /**
     * Render the file read result
     *
     * @param {string} fileReadResult the file read result
     * @return {Component} the component
     * @private
     */
    _successComponent(fileReadResult) { // eslint-disable-line no-unused-vars
        throw new Error('Abstract function call');
    }

    /**
     * Set the remote file
     *
     * @param {RemoteData<string, ApiError>} remoteFile the remote attachment file
     * @return {void}
     */
    _setRemoteFileReadResult(remoteFile) {
        this._remoteFileReadResult = remoteFile;
        this.notify();
    }
}

/**
 * Display an image loaded as a file blob
 */
class ImageFileDisplayComponent extends FileDisplayComponent {
    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _read(reader, file) {
        reader.readAsDataURL(file);
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _successComponent(fileReadResult) {
        return h('img.mw-100.mh-100', {
            alt: this._fileName,
            src: fileReadResult,
        });
    }
}

/**
 * Display a json file loaded as a file blob
 */
class JsonDisplayComponent extends FileDisplayComponent {
    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _read(reader, file) {
        reader.readAsText(file);
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _successComponent(fileReadResult) {
        const jsonContent = JSON.parse(fileReadResult);
        return h('', JSON.stringify(jsonContent, null, 2));
    }
}

/**
 * Display a csv file loaded as a file blob
 */
class CsvDisplayComponent extends FileDisplayComponent {
    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _read(reader, file) {
        reader.readAsText(file);
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _successComponent(fileReadResult) {
        const lines = fileReadResult.split('\n');
        if (lines.length < 2) {
            return h('div', 'Invalid CSV format');
        } else {
            const headers = lines[0].split(',');
            const headerRow = h('tr', headers.map((header, index) => h('th', {
                key: index,
            }, header)));

            const tableRows = lines.slice(1).map((line, rowIndex) => {
                const columns = line.split(',');
                return h('tr', { key: rowIndex }, columns.map((column, colIndex) => h('td', { key: colIndex }, column)));
            });

            return h('table.table.w-100', [
                h('thead', { key: 'thead' }, headerRow),
                h('tbody', { key: 'tbody' }, tableRows),
            ]);
        }
    }
}

/**
 * Display a text file loaded as a file blob
 */
class TextDisplayComponent extends FileDisplayComponent {
    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _read(reader, file) {
        reader.readAsText(file);
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _successComponent(fileReadResult) {
        return h('', fileReadResult);
    }
}

/**
 * Map between file type and the corresponding preview component
 */
const fileTypeToFileDisplayComponent = {
    image: ImageFileDisplayComponent,
    json: JsonDisplayComponent,
    csv: CsvDisplayComponent,
    text: TextDisplayComponent,
};

const FILES_TYPES_WITH_PREVIEW = Object.keys(fileTypeToFileDisplayComponent);

/**
 * Return the general type of the given mimeType
 *
 * @param {string} mimeType the mime type of the file
 * @return {string} the type
 */
const getFileType = (mimeType) => {
    if (mimeType.match(/image\/*/)) {
        return 'image';
    }

    const exactMimeTypes = {
        'application/json': 'json',
        'text/csv': 'csv',
    };

    if (mimeType in exactMimeTypes) {
        return exactMimeTypes[mimeType];
    }

    if (mimeType.match(/text\/*/)) {
        return 'text';
    }

    // Default mime type is application
    return 'application';
};

/**
 * States if a preview is available for the given mime type
 *
 * @param {string} mimeType the mime type to look for preview
 * @return {boolean} true if there is a preview available
 */
export const isPreviewForMimeType = (mimeType) => FILES_TYPES_WITH_PREVIEW.includes(getFileType(mimeType));

/**
 * Display a preview of the given file
 *
 * The following file extensions are tested and implemented, not tested and implemented, or not possible:
 *      Tested and implemented:
 *      - png
 *      - jpg
 *      - txt
 *      - log
 *      - sh
 *      - c
 *      - jpeg
 *      - json
 *      - csv
 *      - gif (image based)
 *
 *      Not tested or implemented as preview:
 *      - pages
 *      - zip
 *      - rtf
 *      - gz
 *      - view1
 *
 *      Not possible (since you need an external url or library):
 *      - docx
 *      - odt
 *      - pdf
 *      - xlsx
 *      - pptx
 *
 * @param {File|Blob} file the file to preview
 * @param {string} mimeType the mime type of the file
 * @param {string} name the name of the file
 * @return {Component} the file preview
 */
export const filePreviewComponent = (file, mimeType, name) => {
    const fileDisplayComponent = fileTypeToFileDisplayComponent[getFileType(mimeType)] ?? null;
    if (fileDisplayComponent === null) {
        return null;
    }

    return h(fileDisplayComponent, { file, name });
};
