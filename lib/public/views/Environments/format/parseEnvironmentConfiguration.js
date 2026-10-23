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
 * Parse a value of the environment configuration that may be a JSON serialized list (e.g. `["FT0", "ITS"]`) or an already parsed one
 *
 * @param {*} value the value to parse
 * @return {string[]} the list
 */
const parseList = (value) => {
    if (Array.isArray(value)) {
        return value;
    }
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

/**
 * @typedef EnvironmentConfigurationSummary
 * @property {string|null} runType the type of the runs of the environment
 * @property {string|null} beamType the PDP beam type
 * @property {string[]} detectors the detectors of the environment
 * @property {number|null} flpsCount the number of FLPs (hosts)
 * @property {number|null} epnsCount the number of EPNs
 */

/**
 * Extract the most relevant information of the raw configuration of an environment
 *
 * @param {string|null} rawConfiguration the raw configuration of the environment (JSON serialized)
 * @return {EnvironmentConfigurationSummary|null} the summary, or null if there is no valid configuration
 */
export const parseEnvironmentConfiguration = (rawConfiguration) => {
    if (!rawConfiguration) {
        return null;
    }

    try {
        const configuration = JSON.parse(rawConfiguration);
        const hosts = parseList(configuration.hosts);
        const epnsCount = parseInt(configuration.odc_n_epns, 10);

        return {
            runType: configuration.run_type ?? null,
            beamType: configuration.pdp_beam_type ?? null,
            detectors: parseList(configuration.detectors),
            flpsCount: hosts.length > 0 ? hosts.length : null,
            epnsCount: isNaN(epnsCount) ? null : epnsCount,
        };
    } catch {
        return null;
    }
};
