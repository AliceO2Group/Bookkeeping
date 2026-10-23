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

import { TriggerValue } from '../../../domain/enums/TriggerValue.js';

/**
 * Parse a value of the environment configuration that may be a JSON serialized list (e.g. `["FT0", "ITS"]`) or an already parsed one
 *
 * @param {*} value the value to parse
 * @return {string[]} the list
 */
const parseList = (value) => {
    if (Array.isArray(value)) {
        return [...value];
    }
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

/**
 * Parse a boolean value of the environment configuration, that may be serialized (e.g. `"true"`)
 *
 * @param {*} value the value to parse
 * @return {boolean} the boolean, false if the value is missing or invalid
 */
const parseBoolean = (value) => {
    try {
        return JSON.parse(value) === true;
    } catch {
        return false;
    }
};

/**
 * @typedef EnvironmentConfigurationSummary
 * @property {string[]} detectors the detectors of the environment
 * @property {boolean} epn true if EPNs are used
 * @property {number|null} nEpns the number of EPNs
 * @property {number|null} nFlps the number of FLPs (hosts, with the CTP readout host if it is enabled)
 * @property {boolean} dcs true if DCS is enabled
 * @property {string} triggerValue the trigger (OFF, LTU or CTP), computed as for the runs started in the environment
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
        if (parseBoolean(configuration.ctp_readout_enabled) && configuration.ctp_readout_host) {
            hosts.push(configuration.ctp_readout_host);
        }
        const nEpns = parseInt(configuration.odc_n_epns, 10);

        let triggerValue = TriggerValue.Off;
        if (parseBoolean(configuration.trg_enabled)) {
            triggerValue = parseBoolean(configuration.trg_global_run_enabled) ? TriggerValue.CTP : TriggerValue.LTU;
        }

        return {
            detectors: parseList(configuration.detectors),
            epn: parseBoolean(configuration.odc_enabled),
            nEpns: isNaN(nEpns) ? null : nEpns,
            nFlps: hosts.length,
            dcs: parseBoolean(configuration.dcs_enabled),
            triggerValue,
        };
    } catch {
        return null;
    }
};
