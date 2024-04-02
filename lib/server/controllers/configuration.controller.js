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

// eslint-disable-next-line valid-jsdoc
const { ServicesConfig } = require('../../config/index.js');

/**
 * @typedef AppConfiguration
 *
 * @property {string} FlpInfologgerUrl
 * @property {string} EpnInfologgerUrl
 * @property {string} AliFlpIndexUrl
 */

// eslint-disable-next-line valid-jsdoc
/**
 * Request to provide configuration to the frontend
 */
const getConfigurationHandler = (_, response) => {
    /**
     * @type {AppConfiguration}
     */
    const configuration = {
        data: {
            FlpInfologgerUrl: ServicesConfig.infologger.flp.url,
            EpnInfologgerUrl: ServicesConfig.infologger.epn.url,
            AliFlpIndexUrl: ServicesConfig.aliFlp.index,
        },
    };

    response.status(200).json(configuration);
};

module.exports = { getConfigurationHandler };
