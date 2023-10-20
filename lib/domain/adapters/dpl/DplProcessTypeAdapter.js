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
 * DplProcessTypeAdapter
 */
class DplProcessTypeAdapter {
    /**
     * Constructor
     */
    constructor() {
    }

    /**
     * Converts the given domain object to an entity object.
     *
     * @param {Run} entityObject Object to convert.
     * @returns {APIRun} Converted entity object.
     */
    toAPIEntity(entityObject) {
    }

    /**
     * Converts the given api entity object to a domain object.
     *
     * @param {APIRun} apiEntityObject Object to convert.
     * @returns {Run} Converted entity object.
     */
    toDomain(apiEntityObject) {
    }
}

exports.DplProcessTypeAdapter = DplProcessTypeAdapter;
