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

const { expect } = require('chai');
const {
    getLhcPeriodStatisticsIdsByPdpBeamTypes,
} = require('../../../../../lib/server/services/lhcPeriod/getLhcPeriodStatisticsIdsByPdpBeamTypes.js');

module.exports = () => {
    it('should successfully return the ids of the statistics of the LHC periods having runs of the given PDP beam types', async () => {
        expect(await getLhcPeriodStatisticsIdsByPdpBeamTypes(['pp'])).to.eql([2]);
        expect(await getLhcPeriodStatisticsIdsByPdpBeamTypes(['PbPb'])).to.eql([1]);
    });

    it('should return each id once when several PDP beam types match the same LHC period', async () => {
        expect(await getLhcPeriodStatisticsIdsByPdpBeamTypes(['pp', 'PbPb', 'pp'])).to.have.members([1, 2]);
    });

    it('should return an empty list when no LHC period has runs of the given PDP beam types', async () => {
        expect(await getLhcPeriodStatisticsIdsByPdpBeamTypes(['unknown'])).to.eql([]);
    });
};
