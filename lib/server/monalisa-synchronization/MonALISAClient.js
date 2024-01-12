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
 * MonALISA Client
 */
class MonALISAClient {
    /**
     * Constructor
     * @param {object} configuration configuration of MonALISA client
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
     * Get data passes from MonALISA with valid names and from LHC Periods not older than specfied by yearLowerLimit options of constructor
     * @return {DataPass[]} data passes list
     */
    async getDataPasses() {
        const payload = await this.fetchDataPasses();
        return this._extractDataPassesFromMonALISAPayload(payload);
    }

    /**
     * Fetch data passes from MonALISA
     * @return {object<string, Partial<MonalisaDataPass>>} raw data acquired from MonALISA: mapping of a data pass name to its parameters
     */
    async fetchDataPasses() {
        const { default: fetch } = await import('node-fetch');
        const specificURL = new URL(this.dataPassesUrl);
        specificURL.searchParams.set('res_path', 'json');
        const response = await fetch(specificURL, this.httpOptions);
        return response.json();
    }

    /**
     * Adapt data pass
     * @param {MonALISADataPass} dataPass data pass
     * @return {DataPass} Convert MonALISA data pass to data pass entity
     */
    _monalisaDataPassToEntity(dataPass) {
        return {
            name: dataPass.name,
            outputSize: dataPass.output_size ? Number(dataPass.output_size) : null,
            reconstructedEventsCount: dataPass.reconstructed_events,
            description: dataPass.description,
            lastRunNumber: dataPass.last_run,
        };
    }

    /**
     * Extract data passes from MonALISA response payload
     * @param {object<string, Partial<MonalisaDataPass>>} payload raw data acquired from MonALISA: mapping of a data pass name to its parameters
     * @return {DataPass[]} adapted data
     */
    _extractDataPassesFromMonALISAPayload(payload) {
        return Object.entries(payload)
            .map(([dataPassName, dataPassParamenters]) => ({
                name: dataPassName.trim(),
                ...dataPassParamenters,
            }))
            .filter((dataPass) => extractLhcPeriod(dataPass.name)?.year >= this.yearLowerLimit)
            .map((dataPass) => this._monalisaDataPassToEntity(dataPass));
    }

    /**
     * Get data pass details
     * @param {string} description description property of a data pass
     * @return {DataPassDetails} data pass details
     */
    async getDataPassDetails(description) {
        const payload = await this.fetchDataPassDetails(description);

        return this._extractDataPassDetailsFromMonALISAPayload(payload);
    }

    /**
     * Fetch data pass details from MonALISA
     * @param {string} description description property of a data pass
     * @return {object<number, { run_no: number }>} MonALISA data pass details endpoint response payload
     */
    async fetchDataPassDetails(description) {
        const { default: fetch } = await import('node-fetch');
        const specificURL = new URL(this.dataPassDetailsUrl);
        specificURL.searchParams.set('res_path', 'json');
        specificURL.searchParams.append('filter_jobtype', description);
        return fetch(specificURL, this.httpOptions).then((response) => response.json());
    }

    /**
     * Extract data pass details from MonALISA response payload
     * @param {object<number, { run_no: number }>} payload MonALISA data pass details endpoint response payload
     * @return {DataPassDetails} Details of the given data pass
     */
    _extractDataPassDetailsFromMonALISAPayload(payload) {
        return { runNumbers: [...new Set(Object.values(payload).map(({ run_no }) => run_no))] };
    }
}

exports.MonALISAClient = MonALISAClient;

/**
 * Create new instace of MonALISAClient
 * @return {MonALISAClient} instance configured with environmental varaibles
 */
exports.setupMonALISAClient = async () => new MonALISAClient({
    dataPassesUrl: monalisaConfiguration.dataPassesUrl,
    dataPassDetailsUrl: monalisaConfiguration.dataPassDetailsUrl,
    yearLowerLimit: monalisaConfiguration.dataPassesYearLowerLimit,
    pfxCertificateBytes: await fs.readFile(monalisaConfiguration.userCertificate.path),
    certificatePassphrase: monalisaConfiguration.userCertificate.passphrase,
});
