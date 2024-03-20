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

const { LhcPeriodRepository } = require('../../../database/repositories');

/**
 * Find or create a lhc period model by its name or id
 *
 * @param {LhcPeriodIdentifier} identifier the criteria to find run type
 * @return {Promise<SequelizeLhcPeriod|null>} the run type found or null
 */
exports.getOrCreateLhcPeriod = async (identifier) => await LhcPeriodRepository.findOneOrCreate(identifier);
