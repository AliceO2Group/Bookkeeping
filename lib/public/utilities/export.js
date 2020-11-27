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
 * Download a file
 *
 * @param {Object} The source content.
 * @param {String} The name of the file including the output format.
 * @param {String} The content type of the file.
 */
const downloadFile = (content, fileName, contentType) => {
    const a = document.createElement("a");
    const file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

/**
 * Create JSON export
 *
 * @param {Object} The source content.
 * @param {String} The name of the file including the output format.
 * @param {String} The content type of the file.
 */
const createJSONExport = (content, fileName, contentType) => {
    const json = JSON.stringify(content, null, 2)
    downloadFile(json, fileName, contentType)
}

/**
 * Create CSV export
 *
 * @param {Object} The source content.
 * @param {String} The name of the file including the output format.
 * @param {String} The content type of the file.
 */
const createCSVExport = (content, fileName, contentType) => {
    const items = content
    const replacer = (key, value) => value === null ? '' : value // specify how to handle null values here
    const header = Object.keys(items[0])
    let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)))
    csv.unshift(header.join(','))
    csv = csv.join('\r\n')
    downloadFile(csv, fileName, contentType)
}

export {
    downloadFile,
    createJSONExport,
    createCSVExport
};
