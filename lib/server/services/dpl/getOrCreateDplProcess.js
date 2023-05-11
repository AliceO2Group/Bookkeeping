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

const { getDplProcess } = require('./getDplProcess.js');
const { createDplProcess } = require('./createDplProcess.js');

/**
 * Fetch (and create if it does not exist) a DPL process
 *
 * @param {{dplProcessName: string, dplProcessTypeId: number}} identifier the identifier of the dpl process to create
 * @return {Promise<SequelizeDplProcess>} the fetch/created dpl process
 */
exports.getOrCreateDplProcess = async (identifier) => {
    const dplProcess = await getDplProcess(identifier);
    if (null === dplProcess) {
        const id = await createDplProcess({ name: identifier.dplProcessName, typeId: identifier.dplProcessTypeId });
        return await getDplProcess({ dplProcessId: id });
    }
    return dplProcess;
};
