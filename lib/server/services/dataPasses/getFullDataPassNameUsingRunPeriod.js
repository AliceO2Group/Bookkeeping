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

const { LhcPeriodRepository } = require('../../../database/repositories/index.js');

/**
 * Get full name of data pass for given suffix and LHC period which given run belongs to
 *
 * @param {string} partialDataPassName data pass name without LHC period name, e.g. apass1, cpass0
 * @param {number} runNumber run number
 * @return {string} data pass name
 */
exports.getFullDataPassNameUsingRunPeriod = async (partialDataPassName, runNumber) => {
    const lhcPeriods = await LhcPeriodRepository.findOne({ include: [{ association: 'runs', where: { runNumber } }] });
    if (!lhcPeriods) {
        throw new Error(`Missing LHC Period information for run (${runNumber})`);
    }

    return `${lhcPeriods.name}_${partialDataPassName}`;
};
