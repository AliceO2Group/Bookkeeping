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
 * @param {{include: string[], exclude: string[]}} tagsFilter the tags used to filter issues
 * @param {Period} period the period in which logs must have been created
 * @return {Promise<SequelizeTag[]>} resolves with the resulting logs list
 */
exports.getLogsByTagsInPeriod = async ({ include = [], exclude = [] }, { from, to }) => {
    /*
     * First fetch the ids of the logs with tags that must be included,
     * because filtering on tags will limit fetched tags to the one matching filtering
     */
    const idsToInclude = (await LogRepository.findAll({
        where: {
            createdAt: {
                [Op.gte]: from,
                [Op.lt]: to,
            },
        },
        include: {
            association: 'tags',
            where: {
                text: {
                    [Op.in]: include,
                },
            },
        },
        raw: true,
    })).map(({ id }) => id);

    /*
     * Secondly, fetch the ids of the logs with tags that must not be included
     * This is needed in 2 queries because of the link table log_tags and sequlize limitations
     */
    const idsToExclude = (await LogRepository.findAll({
        where: {
            createdAt: {
                [Op.gte]: from,
                [Op.lt]: to,
            },
        },
        include: {
            association: 'tags',
            where: {
                text: {
                    [Op.in]: exclude,
                },
            },
        },
        raw: true,
    })).map(({ id }) => id);
    return LogRepository.findAll({
        where: {
            id: {
                [Op.in]: idsToInclude,
                [Op.notIn]: idsToExclude,
            },
        },
        include: {
            association: 'tags',
        },
    });
};
