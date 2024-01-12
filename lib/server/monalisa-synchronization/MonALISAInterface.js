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

const fs = require('fs').promises;
const { ServicesConfig: { monalisa: monalisaConfiguration } } = require('../../config');
const { Log } = require('@aliceo2/web-ui');
const https = require('https');
const { extractLhcPeriod } = require('../utilities/extractLhcPeriod');

/**
 * @typedef MonALISADataPass
 * @param {string} name
 * @param {number} reconstructed_events
 * @param {string} description
 * @param {number} output_size
 * @param {number} last_run
 */

/**
 * @typedef DataPassDetails
 * @param {number[]} runNumbers
 */

/**
 * Interface with MonALISA
 */
class MonALISAInterface {
    /**
     * Constructor
     * @param {object} configuration configuration of synchronizer
     * @param {URL|string} [configuration.dataPassesUrl] url to fetch data passes
     * @param {URL|string} [configuration.dataPassDetailsUrl] url to fetch data pass details
     * @param {string|string[]|Buffer|Buffer[]|Object[]} [configuration.pfxCertificateBytes] PFX or PKCS12 encoded private key
     * and certificate chain @see tls.createSecureContext([options])
     * @param {string} [configuration.certificatePassphrase] passphrase to the certificate
     * @param {number} [configuration.yearLowerLimit] indicates how old data are accepted,
     * year of lhc period that given data pass belongs must be greater or equal
     */
    constructor({
        dataPassesUrl,
        dataPassDetailsUrl,
        pfxCertificateBytes,
        certificatePassphrase,
        yearLowerLimit,
    } = {}) {
        this.logger = new Log(this.constructor.name);
        this.dataPassesUrl = new URL(dataPassesUrl);
        this.dataPassDetailsUrl = new URL(dataPassDetailsUrl);
        this.yearLowerLimit = yearLowerLimit;

        this.httpOptions = {
            headers: {
                Accept:	'application/json;charset=utf-8',
                Connection:	'keep-alive',
            },
            agent: pfxCertificateBytes && certificatePassphrase
                ? new https.Agent({ pfx: pfxCertificateBytes, passphrase: certificatePassphrase }) : undefined,
        };
    }

    /**
     * Get data passes with valid names from MonALISA
     * @return {DataPass[]} data passes
     */
    async getDataPasses() {
        const payload = await this.fetchDataPasses();
        return this.processDataPassesPayload(payload);
    }

    /**
     * Fetch data passes from MonALISA
     * @return {object<string, Partial<MonalisaDataPass>>} payload
     */
    async fetchDataPasses() {
        const { default: fetch } = await import('node-fetch');
        const specificURL = new URL(this.dataPassesUrl);
        specificURL.searchParams.set('res_path', 'json');
        return fetch(specificURL, this.httpOptions).then((response) => response.json());
    }

    /**
     * Adapt data pass
     * @param {MonALISADataPass} dataPass data pass
     * @return {DataPass} adapted data pass
     */
    monalisaDataPassToEntity(dataPass) {
        return {
            name: dataPass.name,
            outputSize: dataPass.output_size ? Number(dataPass.output_size) : null,
            reconstructedEventsCount: dataPass.reconstructed_events,
            description: dataPass.description,
            lastRunNumber: dataPass.last_run,
        };
    }

    /**
     * Process server response payload to database entites, remove unnecessary data
     * @param {object<string, Partial<MonalisaDataPass>>} payload raw data acquired from MonALISA: mapping of Data Pass Name to its parameters
     * @return {DataPass[]} adapted data
     */
    processDataPassesPayload(payload) {
        return Object.entries(payload)
            .map(([dataPassName, dataPassParamenters]) => ({
                name: dataPassName.trim(),
                ...dataPassParamenters,
            }))
            .filter((dataPass) => extractLhcPeriod(dataPass.name)?.year >= this.yearLowerLimit)
            .map((dataPass) => this.monalisaDataPassToEntity(dataPass));
    }

    /**
     * Get data pass details
     * @param {string} description description property of a data pass
     * @return {DataPassDetails} data pass details
     */
    async getDataPassDetails(description) {
        const payload = await this.fetchDataPassDetails(description);

        return this.processDataPassDetailsPayload(payload);
    }

    /**
     * Fetch data pass properties from MonALISA
     * @param {string} description description property of a data pass
     * @return {object<number, { run_no: number }>} payload
     */
    async fetchDataPassDetails(description) {
        const { default: fetch } = await import('node-fetch');
        const specificURL = new URL(this.dataPassDetailsUrl);
        specificURL.searchParams.set('res_path', 'json');
        specificURL.searchParams.append('filter_jobtype', description);
        return fetch(specificURL, this.httpOptions).then((response) => response.json());
    }

    /**
     * Process server response payload to database entites, remove unnecessary data
     * @param {object<number, { run_no: number }>} payload payload
     * @return {DataPassDetails} adapted data
     */
    processDataPassDetailsPayload(payload) {
        return { runNumbers: [...new Set(Object.values(payload).map(({ run_no }) => run_no))] };
    }
}

exports.MonALISAInterface = MonALISAInterface;

/**
 * Create new instace of DataPassesSynchronizer
 * @return {DataPassesSynchronizer} instance configured with environmental varaibles
 */
exports.setupMonALISAInterface = async () => new MonALISAInterface({
    dataPassesUrl: monalisaConfiguration.dataPassesUrl,
    dataPassDetailsUrl: monalisaConfiguration.dataPassDetailsUrl,
    yearLowerLimit: monalisaConfiguration.dataPassesYearLowerLimit,
    pfxCertificateBytes: await fs.readFile(monalisaConfiguration.userCertificate.path),
    certificatePassphrase: monalisaConfiguration.userCertificate.passphrase,
});
