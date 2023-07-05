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

const { NotFoundError } = require('../../errors/NotFoundError.js');
const { getLog } = require('./getLog.js');

/**
 * Fetch a run by its id and throws an error if none is found
 * @param {number} logId the log id
 * @return {Promise<SequelizeLog>} the log found
 */
exports.getLogOrFail = async (logId) => {
    const logModel = await getLog(logId);

    if (logModel !== null) {
        return logModel;
    } else {
        throw new NotFoundError(`Log with this id (${logId}) could not be found`);
    }
};
