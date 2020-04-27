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
 * Function to add one path to another.
 * @param {string} basePath The base path that will be used to append on.
 * @param {string} appendix The path that will be added on the base path.
 * @param {Object} [options={base: 'trim', appendix: 'trim'}] Options to be applied on the appending.
 *                                                            Options are: 'trim' or 'exact'
 * @returns {string} the full appended path
 */
const appendPath = (basePath, appendix) => {
    let preparedBasePath = (typeof (basePath) === 'string') ? basePath : '';
    let preparedAppendix = (typeof (appendix) === 'string') ? appendix : '';

    preparedBasePath = preparedBasePath.match(/([^/| ].*[^/| ])/g) || '';
    preparedAppendix = preparedAppendix.match(/([^/| ].*[^/| ])/g) || '';

    return '/'.concat([preparedBasePath, preparedAppendix].join(preparedBasePath && preparedAppendix ? '/' : ''));
};

module.exports = appendPath;
