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
const { getDetector } = require('../../../../lib/server/services/detector/getDetector.js');
const { createDetector } = require('../../../../lib/server/services/detector/createDetector.js');
const { getOrCreateAllDetectorsByName } = require('../../../../lib/server/services/detector/getOrCreateAllDetectorsByName.js');
const { getAllDetectors } = require('../../../../lib/server/services/detector/getAllDetectors.js');

module.exports = () => {
    it('should successfully retrieve a given detector', async () => {
        const detectorById = await getDetector({ detectorId: 1 });
        expect(detectorById).to.be.an('object');
        expect(detectorById.name).to.equal('CPV');

        const detectorByName = await getDetector({ detectorName: 'CPV' });
        expect(detectorByName).to.be.an('object');
        expect(detectorByName.id).to.equal(1);
    });

    it('should successfully create a detector and return the corresponding ID', async () => {
        const detectorId = await createDetector({ name: 'A-NEW-DETECTOR' });
        expect((await getDetector({ detectorId })).name).to.equal('A-NEW-DETECTOR');
    });

    it('should successfully retrieve a list of detectors and create the missing ones', async () => {
        const detectors = await getOrCreateAllDetectorsByName(['CPV', 'A-NEW-ONE']);
        expect(detectors).to.length(2);
        expect(detectors.map(({ name }) => name)).to.eql(['CPV', 'A-NEW-ONE']);
    });

    it('should successfully return the full list of detectors', async () => {
        const detectors = await getAllDetectors();
        expect(detectors.map(({ id, name }) => ({ id, name }))).to.deep.eq([
            { id: 1, name: 'CPV' },
            { id: 2, name: 'EMC' },
            { id: 3, name: 'FDD' },
            { id: 4, name: 'FT0' },
            { id: 5, name: 'FV0' },
            { id: 6, name: 'HMP' },
            { id: 7, name: 'ITS' },
            { id: 8, name: 'MCH' },
            { id: 9, name: 'MFT' },
            { id: 10, name: 'MID' },
            { id: 11, name: 'PHS' },
            { id: 12, name: 'TOF' },
            { id: 13, name: 'TPC' },
            { id: 14, name: 'TRD' },
            { id: 15, name: 'TST' },
            { id: 16, name: 'ZDC' },
            { id: 17, name: 'ACO' },
            { id: 18, name: 'CTP' },
            { id: 19, name: 'FIT' },
        ]);
    });
};
