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
 * Convert JSON to CSV
 *
 * @param {Object} The source content.
 * @param {Array} The property paths to pick.
 * @returns {String} Returns the new object.
 */
const convertJSONToCSV = (json) => {
    console.log("json", json)
    let array = typeof json != 'object' ? JSON.parse(json) : json;
    console.log("array", array)
    let str = '';

    for (let i = 0; i < array.length; i++) {
        let line = '';
        for (let index in array[i]) {
            if (line != '') line += ','

            line += array[i][index];
        }

        str += line + '\r\n';
    }

    console.log("str", str)

    return str;
}

/**
 * Create JSON export
 *
 * @param {Object} The source content.
 * @param {Array} The property paths to pick.
 * @returns {String} Returns the new object.
 */
const createJSONExport = (content, fileName, contentType) => {
    const json = JSON.stringify(content)
    console.log("json", json)
    const a = document.createElement("a");
    const file = new Blob([json], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

/**
 * Create CSV export
 *
 * @param {Object} The source content.
 * @param {Array} The property paths to pick.
 * @returns {String} Returns the new object.
 */
const createCSVExport = (content, fileName, contentType) => {
    const json = JSON.stringify(content);
    const csv = convertJSONToCSV(json);
    const a = document.createElement("a");
    const file = new Blob([csv], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

export {
    createJSONExport,
    createCSVExport
};
