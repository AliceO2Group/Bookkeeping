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

const LogEnvironmentsRepository = require('../../../database/repositories/LogEnvironmentsRepository.js');
const { getAllEnvironments } = require('./getAllEnvironments.js');

/**
 * Returns the environments that are associated with the given log
 *
 * @param {number} logId the log id that the environments should be associated with
 * @return {Promise<SequelizeEnvironment[]>} resolves with the resulting environments list
 */
exports.getAllEnvironmentsByLogId = async (logId) => {
    const environmentIds = (await LogEnvironmentsRepository.findAll({
        where: {
            logId: logId,
        },
    })).map(({ environmentId }) => environmentId);
    const environments = await getAllEnvironments(environmentIds);
    return environments;
};
