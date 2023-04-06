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

import { h } from '/js/src/index.js';

/**
 * Generic error alert.
 *
 * @param {object[]|object} errors The JSON:API conform error object.
 * @returns {vnode[]} The list of vnodes representing the alerts.
 */
const errorAlert = (errors) => {
    if (!Array.isArray(errors)) {
        errors = [errors];
    }

    return errors.map((error) => {
        if (error.detail) {
            return h('.alert.alert-danger', h('b', `${error.title}: `), error.detail);
        } else {
            return h('.alert.alert-danger', h('b', error.title));
        }
    });
};

export default errorAlert;
