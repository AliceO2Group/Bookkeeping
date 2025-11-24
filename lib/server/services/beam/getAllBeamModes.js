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

const { repositories: { RunRepository }, sequelize } = require('../../../database');
const { Op } = require('sequelize');

/**
 * Return the list of all the available detectors
 *
 * @returns {Promise<SequelizeBeamMode[]>} Promise resolving with the list of beam modes
 */
exports.getAllBeamModes = async () => {
    const t = await RunRepository.findAll({
        where: {
            lhc_beam_mode: {
                [Op.ne]: null,
            },
        },
        attributes: [[sequelize.fn('DISTINCT', sequelize.col('lhc_beam_mode')), 'name']],
    });
    return t;
};
