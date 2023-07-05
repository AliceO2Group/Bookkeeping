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

const { getDplProcessType } = require('./getDplProcessType.js');
const { createDplProcessType } = require('./createDplProcessType.js');

/**
 * Fetch (and create if it does not exist) a DPL process type
 *
 * @param {{dplProcessTypeLabel: string}} identifier the identifier of the dpl process type to create
 * @return {Promise<SequelizeDplProcessType>} the fetch/created dpl process type
 */
exports.getOrCreateDplProcessType = async (identifier) => {
    const dplProcessType = await getDplProcessType(identifier);

    if (dplProcessType !== null) {
        return dplProcessType;
    }

    const id = await createDplProcessType({ label: identifier.dplProcessTypeLabel });
    return await getDplProcessType({ dplProcessTypeId: id });
};
