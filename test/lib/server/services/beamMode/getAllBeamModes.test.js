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
const { getAllBeamModes } = require('../../../../../lib/server/services/beam/getAllBeamModes.js');

module.exports = () => {
    it('should successfully return the full list of not null beam modes from runs table', async () => {
        const beamModes = await getAllBeamModes();
        expect(beamModes.map(({ dataValues: { name } }) => ({ name }))).to.deep.eq([
            { name: 'STABLE BEAMS' },
            { name: 'STABLE' },
            { name: 'NO BEAM' },
            { name: 'UNSTABLE BEAMS' },
        ]);
    });
};
