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

const { repositories: { LhcFillRepository }, sequelize } = require('../../../database');
const { Op } = require('sequelize');

/**
 * Return the a list of unique beam types which is built from the runs data
 *
 * @returns {Promise<SequelizeBeamType[]>} Promise resolving with the list of unique beam types
 */
exports.getAllBeamTypes = async () => {
    const beamTypes = await LhcFillRepository.findAll({
        attributes: [[sequelize.fn('DISTINCT', sequelize.col('beam_type')), 'beam_type']],
        where: {
            beam_type: {
                [Op.ne]: null,
            },
        },
        order: [['beam_type', 'ASC']],
        raw: true,
    });
    return beamTypes;
};
