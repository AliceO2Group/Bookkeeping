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
import { h } from '/js/src/index.js';

/**
 * Display the given environment's status history string
 *
 * @param {Environment} environment the environment for which status should be displayed
 * @return {vnode} the resulting component
 */
export const displayEnvironmentStatusHistory = (environment) => {
    const { historyItems } = environment;

    const statusAcronyms = {
        STANDBY: 'S',
        DEPLOYED: 'DL',
        CONFIGURED: 'C',
        RUNNING: 'R',
        ERROR: 'E',
        MIX: 'M',
        DESTROYED: 'DS',
    };

    /**
     * Get correct color class from environmentname.
     * @param {*} status
     * @returns {string}
     */
    const getColorClassEnvironment = (status) => {
        switch (status) {
            case 'RUNNING':
                return '.success';
            case 'ERROR':
                return '.danger';
            case 'CONFIGURED':
                return '.warning';
            default:
                return '';
        }
    };

    const statusHistory = [];

    // Iterate through historyItems
    for (const { status } of historyItems) {
        if (status in statusAcronyms) {
            statusHistory.push({ status, content: statusAcronyms[status] });
            statusHistory.push({ status: null, content: '-' });
        };
    };

    statusHistory.pop();

    return h(
        '.flex-row',
        statusHistory.map((value) => h(getColorClassEnvironment(value.status), value.content)),
    );
};
