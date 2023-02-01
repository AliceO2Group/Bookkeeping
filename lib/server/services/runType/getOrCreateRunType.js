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

const { getRunType } = require('./getRunType.js');
const { createRunType } = require('./createRunType.js');

/**
 * Fetch a given run type identifier and create it if it does not exist
 *
 * @param {RunTypeIdentifier} identifier the criteria to find run type
 * @return {RunType} the retrieved (or created) run type
 */
exports.getOrCreateRunType = async (identifier) => {
    const runType = await getRunType(identifier);
    if (null === runType) {
        const id = await createRunType({ name: identifier.name });
        return await getRunType({ id });
    }
    return runType;
};
