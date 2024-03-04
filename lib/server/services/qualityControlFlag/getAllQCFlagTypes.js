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

const { repositories: { QCFlagTypeRepository } } = require('../../../database');
const { qcFlagTypeAdapter } = require('../../../database/adapters');

/**
 * Find all quality control flag types
 * @return {Promise<QCFlagType[]>} flag types list promise
 */
exports.getAllQCFlagTypes = async () => {
    const flagTypes = await QCFlagTypeRepository.findAll({
        include: [
            { association: 'createdBy' },
            { association: 'lastUpdatedBy' },
        ],
    });

    return flagTypes.map(qcFlagTypeAdapter.toEntity);
};
