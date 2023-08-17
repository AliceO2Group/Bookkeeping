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
 * @param {String} title the title used to filter issues
 * @param {Object} [options] fetch configuration
 * @param {Boolean} [options.rootOnly=false] if true, only root logs will be fetched
 * @return {Promise<SequelizeLog[]>} resolves with the resulting logs list
 */
exports.getLogsByTitle = async (title, options) => {
    const { rootOnly = false } = options || {};

    const whereClause = {
        title: {
            [Op.eq]: title,
        },
    };
    if (rootOnly) {
        whereClause.parentLogId = null;
    }

    return LogRepository.findAll({
        where: whereClause,
        include: { association: 'tags' },
    });
};
