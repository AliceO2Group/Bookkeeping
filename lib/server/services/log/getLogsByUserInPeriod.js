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

const { LogRepository } = require('../../../database/repositories/index.js');
const { Op } = require('sequelize');
const { logIncludeClauseFromRelations } = require('./logIncludeClauseFromRelations.js');

/**
 * Returns the list of logs created by a specific user in the given period
 *
 * @param {SequelizeUser} user the user that must have created the logs
 * @param {Period} period the period in which tags must be included
 * @param {LogRelationsToInclude} relations the relations to include
 * @return {Promise<Array>} resolves with the list of tags
 */
exports.getLogsByUserInPeriod = (user, { from, to }, relations) => LogRepository.findAll({
    where: {
        [Op.and]: [
            {
                createdAt: {
                    [Op.gte]: from,
                    [Op.lt]: to,
                },
            },
        ],
    },
    include: [
        ...logIncludeClauseFromRelations(relations),
        {
            association: 'user',
            where: { id: user.id },
        },
    ],
});
