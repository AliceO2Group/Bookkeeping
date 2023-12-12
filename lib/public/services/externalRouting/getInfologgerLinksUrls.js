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
 * Format the infologger URLs (FLP and EPN) with specific filters
 *
 * @param {object} filter the filter to apply to infologger
 * @param {string} [filter.environmentId] the id of environment to filter on (partition)
 * @param {number} [filter.runNumber] the runNumber of the run to filter on
 * @param {Run[]} [filter.runs] the runs of the lhcFill to filter on
 * @return {{flp: (string|null), epn: (string|null)}} the infologger link URLs (null if no infologger is configured for the given type)
 */
export const getInfologgerLinksUrls = ({ environmentId, runNumber, runs }) => {
    const queryObject = {};
    if (environmentId) {
        queryObject.partition = { match: environmentId };
    }

    if (runs && runs.length > 0) {
        const runNumberArray = runs.map((run) => run.runNumber);
        queryObject.run = { match: `${runNumberArray}` };
    }

    if (runNumber) {
        queryObject.run = { match: `${runNumber}` };
    }

    // eslint-disable-next-line require-jsdoc
    const formatUrl = (origin) => origin ? `${origin}?q=${JSON.stringify(queryObject)}` : null;

    return {
        flp: formatUrl(FLP_INFOLOGGER_URL),
        epn: formatUrl(EPN_INFOLOGGER_URL),
    };
};
