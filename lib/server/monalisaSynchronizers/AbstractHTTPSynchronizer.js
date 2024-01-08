/**
 *
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

const { Log } = require('@aliceo2/web-ui');
const { jsonRequest } = require('../utilities/jsonRequest.js');
const { deepmerge } = require('../../utilities/index.js');

/**
 * AbstractServiceSynchronizer
 * The class provides schema for excecuting process of data synchronization with external service (fetching from it)
 * Its behaviour can be customized with overriding abstract methods
 */
class AbstractHTTPSynchronizer {
    /**
     * Constructor
     * @param {https.RequestOptions} httpOptions requests options
     */
    constructor(httpOptions = {}) {
        this.logger = new Log(this.constructor.name);
        this.options = deepmerge(this.createHttpOpts(), httpOptions);
    }

    /**
     * Create basic http request options
     * @return {https.RequestOptions} basic options
     */
    createHttpOpts() {
        return {
            rejectUnauthorized: false,
            allowRedirects: true,
            headers: {
                Accept:	'application/json;charset=utf-8',
                'Accept-Language':	'en-US,en;q=0.5',
                Connection:	'keep-alive',
                'User-Agent': 'Mozilla/5.0',
            },
        };
    }

    /**
     * Combine logic of fetching data from service like bookkeeping, processing and inserting to database
     * @param {URL} url endpoint to fetch data from
     * @param {object} context db action context
     * Besides the given arguemnt the method depends on two abstract methods to be overriden
     * @see AbstractHTTPSynchronizer.processRawResponse
     * @see AbstractHTTPSynchronizer.executeDbAction
     *
     * @returns {boolean} - true if process was finalized without major errors and with/without minor errors, otherwise false,
     * Major errors are understood as ones indicating that further synchronization is purposeless: e.g. due to networ error, invalid certificate.
     * Minor errors are understood as e.g. managable ambiguities in data.
     */
    async syncPerEndpoint(url, context = {}) {
        return await jsonRequest(url, this.options)
            .then(async (rawResponse) => this.processRawResponse(rawResponse))
            .then(async (data) => await this.executeDbActiont(data, { url, ...context }))
            .then(() => true) // Passed without major errors
            .catch(async (fatalError) => {
                this.logger.error(`Synchronizer fatal error: ${fatalError.message}`);
                return false; // Major error occurred
            });
    }

    /**
     * ProcessRawResponse - used to preprocess response to custom format
     * @abstractMethod
     * @param {*} _rawResponse - raw data acquired from external service
     * @return {*} adjusted data
     */
    async processRawResponse(_rawResponse) {
        throw new Error('Abstract function call');
    }

    /**
     * Implements logic for inserting/updating database data
     * @abstractMethod
     * @param {*} _data - data unit some db action is to be performed on
     * @param {object} _options - some meta data, e.g. context required execute db action
     * @return {void}
     */
    async executeDbAction(_data, _options) {
        throw new Error('Abstract function call');
    }
}

// TODO when redirects for monalisa nextLocation.searchParams.set('res_path', 'json');

exports.AbstractHTTPSynchronizer = AbstractHTTPSynchronizer;
