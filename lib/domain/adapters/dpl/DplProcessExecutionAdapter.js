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
 * APIDplProcessExecutionAdapter
 */
class APIDplProcessExecutionAdapter {
    /**
     * Constructor
     */
    constructor() {
        this.apiDplDetectorAdapter = null;
        this.apiHostAdapter = null;
        this.apiDplProcessAdapter = null;

        this.runAdapter = null;

        this.toAPIEntity = this.toAPIEntity.bind(this);
        this.toDomain = this.toDomain.bind(this);
    }

    /**
     * Converts the given domain object to an entity object.
     *
     * @param {DplProcessExecution} entityObject Object to convert.
     * @returns {APIDplProcessExecution} Converted entity object.
     */
    toAPIEntity(entityObject) {
        const { host, process, run, detector } = entityObject;
        return {
            ...entityObject,
            host: host ? this.apiHostAdapter.toAPIEntity(host) : host,
            process: process ? this.apiDplProcessAdapter.toAPIEntity(process) : process,
            run: run ? this.runAdapter.toAPIEntity(run) : run,
            detector: detector ? this.detector.toAPIEntity(detector) : detector,
        };
    }

    /**
     * Converts the given api entity object to a domain object.
     *
     * @param {APIDplProcessExecution} apiEntityObject Object to convert.
     * @returns {DplProcessExecution} Converted entity object.
     */
    toDomain(apiEntityObject) {
        const { host, process, run, detector } = apiEntityObject;
        return {
            ...apiEntityObject,
            host: host ? this.apiHostAdapter.toDomain(host) : host,
            process: process ? this.apiDplProcessAdapter.toDomain(process) : process,
            run: run ? this.runAdapter.toDomain(run) : run,
            detector: detector ? this.detector.toDomain(detector) : detector,
        };
    }
}

exports.APIDplProcessExecutionAdapter = APIDplProcessExecutionAdapter;
