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
const https = require('https');
const { extractLhcPeriod } = require('../utilities/extractLhcPeriod');
const fs = require('fs').promises;

/**
 * @typedef MonAlisaDataPass
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
 * @typedef MonAlisaSimulationPass
 * @param {string} name
 * @param {string} jiraID
 * @param {string} anchor_production
 * @param {string} anchor_pass
 * @param {string} runList
 * @param {string} generator
 * @param {string} requested_events
 * @param {string} generated_events
 * @param {string} output_size
 */

/**
 * @typedef SimulationPassAssociations
 * @param {string[]} lhcPeriods
 * @param {string[]} dataPassesSuffixes
 * @param {number[]} runNumbers
 */

/**
 * MonAlisa Client
 */
class MonAlisaClient {
    /**
     * Constructor
     * @param {object} configuration configuration of MonAlisa client
     * @param {URL|string} [configuration.dataPassesUrl] url to fetch data passes
     * @param {URL|string} [configuration.dataPassDetailsUrl] url to fetch data pass details
     * @param {string|string[]|Buffer|Buffer[]|Object[]} [configuration.pfxCertificateBytes] PFX or PKCS12 encoded private key
     * and certificate chain @see tls.createSecureContext([options])
     * @param {string} [configuration.certificatePassphrase] passphrase to the certificate
     * @param {number} [configuration.yearLowerLimit] indicates how old data are accepted,
     * year of lhc period that given data pass belongs must be greater or equal
     * @param {URL|string} [configuration.simulationPassesUrl] url to fetch simulation passes
     */
    constructor({
        dataPassesUrl,
        dataPassDetailsUrl,
        pfxCertificateBytes,
        certificatePassphrase,
        yearLowerLimit,
        simulationPassesUrl,
    } = {}) {
        this.logger = new Log(this.constructor.name);
        this.dataPassesUrl = dataPassesUrl ? new URL(dataPassesUrl) : null;
        this.dataPassDetailsUrl = dataPassDetailsUrl ? new URL(dataPassDetailsUrl) : null;
        this.yearLowerLimit = yearLowerLimit;

        this.simulationPassesUrl = simulationPassesUrl ? new URL(simulationPassesUrl) : null;

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
     * Get data passes from MonAlisa with valid names and from LHC Periods not older than specfied by yearLowerLimit options of constructor
     * @return {DataPass[]} data passes list
     */
    async getDataPasses() {
        const payload = await this._fetchDataPasses();
        return this._extractDataPassesFromMonAlisaPayload(payload);
    }

    /**
     * Fetch data passes from MonAlisa
     * @return {object<string, Partial<MonAlisaDataPass>>} raw data acquired from MonAlisa: mapping of a data pass name to its parameters
     * @private
     */
    async _fetchDataPasses() {
        const { default: fetch } = await import('node-fetch');
        const specificURL = new URL(this.dataPassesUrl);
        specificURL.searchParams.set('res_path', 'json');
        const response = await fetch(specificURL, this.httpOptions);
        return response.json();
    }

    /**
     * Adapt data pass
     * @param {MonAlisaDataPass} dataPass data pass
     * @return {DataPass} Convert MonAlisa data pass to data pass entity
     * @private
     */
    _monAlisaDataPassToEntity(dataPass) {
        return {
            name: dataPass.name,
            outputSize: dataPass.output_size ? Number(dataPass.output_size) : null,
            reconstructedEventsCount: dataPass.reconstructed_events,
            description: dataPass.description,
            lastRunNumber: dataPass.last_run,
        };
    }

    /**
     * Extract data passes from MonAlisa response payload
     * @param {object<string, Partial<MonAlisaDataPass>>} payload raw data acquired from MonAlisa: mapping of a data pass name to its parameters
     * @return {DataPass[]} adapted data
     * @private
     */
    _extractDataPassesFromMonAlisaPayload(payload) {
        return Object.entries(payload)
            .map(([dataPassName, dataPassParamenters]) => ({
                name: dataPassName.trim(),
                ...dataPassParamenters,
            }))
            .filter((dataPass) => extractLhcPeriod(dataPass.name)?.year >= this.yearLowerLimit)
            .map((dataPass) => this._monAlisaDataPassToEntity(dataPass));
    }

    /**
     * Get data pass details
     * @param {string} description description property of a data pass
     * @return {DataPassDetails} data pass details
     */
    async getDataPassDetails(description) {
        const payload = await this._fetchDataPassDetails(description);

        return this._extractDataPassDetailsFromMonAlisaPayload(payload);
    }

    /**
     * Fetch data pass details from MonAlisa
     * @param {string} description description property of a data pass
     * @return {object<number, { run_no: number }>} MonAlisa data pass details endpoint response payload
     * @private
     */
    async _fetchDataPassDetails(description) {
        const { default: fetch } = await import('node-fetch');
        const specificURL = new URL(this.dataPassDetailsUrl);
        specificURL.searchParams.set('res_path', 'json');
        specificURL.searchParams.append('filter_jobtype', description);
        return fetch(specificURL, this.httpOptions).then((response) => response.json());
    }

    /**
     * Extract data pass details from MonAlisa response payload
     * @param {object<number, { run_no: number }>} payload MonAlisa data pass details endpoint response payload
     * @return {DataPassDetails} Details of the given data pass
     * @private
     */
    _extractDataPassDetailsFromMonAlisaPayload(payload) {
        return { runNumbers: [...new Set(Object.values(payload).map(({ run_no }) => run_no))] };
    }

    /**
     * Get data passes from MonAlisa associated with at least one data pass
     * @return {{properties: SimulationPass, associations: SimulationPassAssociations}[]} simulation passes list
     */
    async getSimulationPasses() {
        const payload = await this._fetchSimulationPasses();
        return this._extractSimulationPassesFromPayload(payload);
    }

    /**
     * Fetch simulation passes from MonAlisa
     * @return {object<string, Partial<MonAlisaSimulationPass>>} raw data acquired from MonAlisa:
     * mapping of a simulation pass name to its parameters
     * @private
     */
    async _fetchSimulationPasses() {
        const { default: fetch } = await import('node-fetch');
        const specificURL = new URL(this.simulationPassesUrl);
        specificURL.searchParams.set('res_path', 'json');
        const response = await fetch(specificURL, this.httpOptions);
        return response.json();
    }

    /**
     * Extract simulation passes from MonAlisa response payload
     * @param {object<string, Partial<MonAlisaSimulationPass>>} payload raw data acquired from MonAlisa:
     * mapping of a simulation pass name to its parameters
     * @return {{properties: SimulationPass, associations: SimulationPassAssociations}[]} adapted data
     * @private
     */
    _extractSimulationPassesFromPayload(payload) {
        return Object.entries(payload).map(([simulationPassName, simulationPassParameters]) => ({
            ...simulationPassParameters,
            name: simulationPassName,
        }))
            .filter(({ anchor_production, anchor_pass }) => anchor_production.trim() && anchor_pass.trim())
            .map((simulationPass) => this._monAlisaSimulationPassToEntity(simulationPass))
            .filter(({ associations: { lhcPeriods, dataPassesSuffixes } }) => lhcPeriods.length > 0 && dataPassesSuffixes.length > 0);
    }

    /**
     * Extract jira id from simulation pass description
     * @param {string} description simulation pass description
     * @return {{extractedJiraId: string, extractedDescription: string}} jira id and lighten description
     */
    _extractJiraIdFromDescription(description) {
        if (/, [A-Z]+[A-Z0-9]+-\d+/.test(description)) {
            const descriptionItems = description.split(',');
            const jiraId = descriptionItems.pop().trim();
            return {
                extractedJiraId: jiraId,
                extractedDescription: descriptionItems.join(','),
            };
        } else {
            return {
                extractedJiraId: null,
                extractedDescription: description.trim(),
            };
        }
    }

    /**
     * Adapt simulation pass from MonAlisa to entity and its associations
     * @param {MonAlisaSimulationPass} simulationPass simulation pass
     * @return {{properties: SimulationPass, associations: SimulationPassAssociations}} simulation pass entity with its association data
     * @private
     */
    _monAlisaSimulationPassToEntity(simulationPass) {
        const { extractedDescription, extractedJiraId } = this._extractJiraIdFromDescription(simulationPass.generator);
        return {
            properties: {
                name: simulationPass.name,
                jiraId: extractedJiraId || simulationPass.jiraID?.trim() || null,
                description: extractedDescription || null,
                pwg: simulationPass.PWG?.trim() || null,
                requestedEventsCount: Number(simulationPass.requested_events),
                generatedEventsCount: Number(simulationPass.generated_events),
                outputSize: Number(simulationPass.output_size),
            },

            associations: {
                lhcPeriods: simulationPass.anchor_production
                    .split(',')
                    .map((lhcPeriod) => lhcPeriod.trim())
                    .filter((lhcPeriod) => extractLhcPeriod(lhcPeriod)?.year >= this.yearLowerLimit),
                dataPassesSuffixes: simulationPass.anchor_pass
                    .split(',')
                    .map((suffix) => suffix.trim())
                    .filter((suffix) => suffix),
                runNumbers: simulationPass.runList
                    .split(',')
                    .filter((runNumber) => runNumber.trim())
                    .map((runNumber) => Number(runNumber)),
            },
        };
    }
}

exports.MonAlisaClient = MonAlisaClient;

/**
 * Create new instace of MonAlisaClient
 * @param {object} configuration configuration of MonAlisa client
 * @param {URL|string} [configuration.dataPassesUrl] url to fetch data passes
 * @param {URL|string} [configuration.dataPassDetailsUrl] url to fetch data pass details
 * @param {number} [configuration.yearLowerLimit] indicates how old data are accepted,
 * @param {string} [configuration.userCertificatePath] path to PKCS12 certificate
 * @param {string} [configuration.certificatePassphrase] passphrase to the certificate
 * @return {MonAlisaClient} instance configured with environmental varaibles
 */
exports.createMonAlisaClient = async ({
    dataPassesUrl,
    dataPassDetailsUrl,
    simulationPassesUrl,
    yearLowerLimit,
    userCertificatePath,
    certificatePassphrase,
}) => new MonAlisaClient({
    dataPassesUrl,
    dataPassDetailsUrl,
    simulationPassesUrl,
    yearLowerLimit,
    pfxCertificateBytes: await fs.readFile(userCertificatePath),
    certificatePassphrase,
});
