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

const { getEnvironmentsByText } = require('./getEnvironmentsByText.js');

/**
 * Extract all the environments corresponding to a list of environments text. If any of the text do not correspond to a tag, throw an error
 *
 * @param {string[]} [environmentsTexts] the list of environments text
 * @return {Promise<SequelizeEnvironment[]>} the list of environments
 */
const getAllEnvironmentsByTextOrFail = async (environmentsTexts) => {
    if (!environmentsTexts) {
        return [];
    }

    const environments = await getEnvironmentsByText(environmentsTexts);

    const missingEnvironments = environmentsTexts.filter((text) => !environments.find((env) => text === env.id));
    if (missingEnvironments.length > 0) {
        throw new Error(`Environments ${missingEnvironments.join(', ')} could not be found`);
    }

    return environments;
};

exports.getAllEnvironmentsByTextOrFail = getAllEnvironmentsByTextOrFail;
