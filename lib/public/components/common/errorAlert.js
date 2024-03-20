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

import { h } from '@aliceo2/web-ui/Frontend/js/src/index.js';

/**
 * @typedef ApiError
 * @property {string} title the error's title
 * @property {Component} [detail] the error's details
 */

/**
 * Generic error alert.
 *
 * @param {ApiError[]|ApiError} errors The JSON:API conform error object.
 * @returns {Component} the error alerts component
 */
const errorAlert = (errors) => {
    if (!Array.isArray(errors)) {
        errors = [errors];
    }

    errors = errors.filter((error) => Boolean(error));

    if (!errors.length) {
        return null;
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
