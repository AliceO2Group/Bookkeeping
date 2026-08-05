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
const { getAllPdpBeamTypes } =  require('../../../../../lib/server/services/beam/getAllPdpBeamTypes.js');

module.exports = () => {
    it('should successfully return the full list of not null PDP beam types from runs table', async () => {
        const pdpBeamTypes = await getAllPdpBeamTypes();
        expect(pdpBeamTypes.map(({ dataValues: { name } }) => ({ name }))).to.deep.eq([
            { beam_type: 'pp' },
            { beam_type: 'PbPb' },
            { beam_type: 'technical' },
            { beam_type: 'cosmic' },
            { beam_type: 'OO' },
        ]);
    });
};
