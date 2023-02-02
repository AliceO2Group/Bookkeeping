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
const { getDetector } = require('../../../../../lib/server/services/detector/getDetector.js');

module.exports = () => {
    it('should successfully retrieve a given detector', async () => {
        const detectorById = await getDetector({ detectorId: 1 });
        expect(detectorById).to.be.an('object');
        expect(detectorById.name).to.equal('CPV');

        const detectorByName = await getDetector({ detectorName: 'CPV' });
        expect(detectorByName).to.be.an('object');
        expect(detectorByName.id).to.equal(1);
    });

    it('should throw an error when not providing name or id', async () => {
        expect(() => getDetector({})).to.throw('Cannot find without detector id or detector name');
    });
};
