/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

const { CONFIGURATION: { FLP_INFOLOGGER_URL, EPN_INFOLOGGER_URL } } = window;

/**
 * @typedef InfologgerUrlFilter
 * @property {string} [environmentId] the id of environment to filter on (partition)
 * @property {number | number[]} [runNumbers] the run number(s) to filter on
 */

/**
 * Format the infologger URLs (FLP and EPN) with specific filters
 *
 * @param {InfologgerUrlFilter} filter the filter to apply to infologger
 * @return {{flp: (string|null), epn: (string|null)}} the infologger link URLs (null if no infologger is configured for the given type)
 */
export const getInfologgerLinksUrls = ({ environmentId, runNumbers }) => {
    const queryObject = {};

    if (environmentId) {
        queryObject.partition = { match: environmentId };
    }

    runNumbers = Array.isArray(runNumbers) ? runNumbers : [runNumbers];
    if (runNumbers.length) {
        queryObject.run = { match: `${runNumbers.filter((runNumber) => runNumber).join(',')}` };
    }

    /**
     * Formats the URL with the given infologger and query object.
     * @param {string} origin - The baseURL of the infologger.
     * @returns {string|null} The formatted URL or null if the origin is not provided.
     */
    const formatUrl = (origin) => origin ? `${origin}?q=${JSON.stringify(queryObject)}` : null;

    return {
        flp: formatUrl(FLP_INFOLOGGER_URL),
        epn: formatUrl(EPN_INFOLOGGER_URL),
    };
};
