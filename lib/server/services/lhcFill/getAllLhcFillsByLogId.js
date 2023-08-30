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

const LhcFillRepository = require('../../../database/repositories/LhcFillRepository.js');

/**
 * Returns the lhcFills that are associated with the given log
 *
 * @param {number} logId the log id that the lhcFills should be associated with
 * @return {Promise<SequelizelhcFills[]>} resolves with the resulting lhcFills list
 */
exports.getAllLhcFillsByLogId = async (logId) => {
    const lhcFills = await LhcFillRepository.findAll({
        include: {
            association: 'logs',
            where: {
                id: logId,
            },
            attributes: [],
        },
    });
    return lhcFills;
};
