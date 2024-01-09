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

/**
 * AbstractHTTPSynchronizer
 * The class provides schema for excecuting process of data synchronization with external service
 * Its behaviour can be customized with overriding abstract methods
 * Communication is carried via http with json data format
 */
class AbstractHTTPSynchronizer {
    /**
     * Constructor
     * @param {object} httpOptions http(s).requests options
     */
    constructor(httpOptions = {}) {
        this.logger = new Log(this.constructor.name);
        this.httpOptions = {
            headers: {
                Accept:	'application/json;charset=utf-8',
                Connection:	'keep-alive',
            },
            ...httpOptions,
        };
    }

    /**
     * Combine logic of fetching data from service like MonALISA, processing and inserting to database
     * @param {URL} url endpoint to fetch data from
     * @param {object} context db action context
     *
     * @returns {Promise<void>} promise
     */
    async syncPerEndpoint(url, context = {}) {
        const { default: fetch } = await import('node-fetch');

        return await fetch(url, this.httpOptions)
            .then((response) => response.json())
            .then((rawData) => this.processRawResponse(rawData))
            .then((data) => this.executeDbAction(data, { url, ...context }));
    }

    /**
     * Used to process raw response to custom format, remove unnecessary data
     * @abstract
     * @param {object} _rawResponse raw data acquired from external service
     * @return {*} adjusted data
     */
    async processRawResponse(_rawResponse) {
        throw new Error('Abstract function call');
    }

    /**
     * Implements logic for inserting/updating database
     * @abstract
     * @param {*} _data data with which some db action is to be performed
     * @param {object} _context - some meta data, e.g. context required to execute db action
     * @return {void}
     */
    async executeDbAction(_data, _context) {
        throw new Error('Abstract function call');
    }
}

exports.AbstractHTTPSynchronizer = AbstractHTTPSynchronizer;
