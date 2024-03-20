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

const { utilities: { QueryBuilder } } = require('../../../database');
const RunTypeRepository = require('../../../database/repositories/RunTypeRepository.js');
const { BadParameterError } = require('../../errors/BadParameterError.js');

/**
 * @typedef RunTypeIdentifier object to uniquely identify a run type
 * @property {string} [name] the run type name
 * @property {number} [id] the id of the run type, ignored if name is present
 */

/**
 * Find and return a run type model by its name or id
 *
 * @param {RunTypeIdentifier} identifier the criteria to find run type
 * @param {function|null} qbConfiguration function called with the run type find query builder as parameter to add specific configuration to the
 *     query
 * @return {Promise<SequelizeRunType|null>} the run type found or null
 */
exports.getRunType = ({ name, id }, qbConfiguration = null) => {
    const queryBuilder = new QueryBuilder();

    if (name) {
        queryBuilder.where('name').is(name);
    } else if (id) {
        queryBuilder.where('id').is(id);
    } else {
        throw new BadParameterError('Can not find without run type id or name');
    }

    if (qbConfiguration) {
        qbConfiguration(queryBuilder);
    }
    return RunTypeRepository.findOne(queryBuilder);
};
