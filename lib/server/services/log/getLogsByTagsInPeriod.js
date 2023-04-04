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

/**
 * Returns the logs created in the given period that have at least one of the given tags
 *
 * @param {string[]} tagsTexts the list of possible tags that logs must have
 * @param {Period} period the period in which logs must have been created
 * @return {Promise<Array>} resolves with the resulting logs list
 */
exports.getLogsByTagsInPeriod = async (tagsTexts, { from, to }) => {
    // First fetch the ids, because filtering on tags will limit fetched tags to the one matching filtering
    const ids = (await LogRepository.findAll({
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
        include: {
            association: 'tags',
            where: {
                text: {
                    [Op.in]: tagsTexts,
                },
            },
        },
        raw: true,
    })).map(({ id }) => id);
    return LogRepository.findAll({
        where: {
            id: {
                [Op.in]: ids,
            },
        },
        include: {
            association: 'tags',
        },
    });
};
