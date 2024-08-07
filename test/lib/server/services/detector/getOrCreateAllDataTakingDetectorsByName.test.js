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
const { getOrCreateAllDataTakingDetectorsByName }
    = require('../../../../../lib/server/services/detector/getOrCreateAllDataTakingDetectorsByName.js');
const { DetectorRepository } = require('../../../../../lib/database/repositories/index.js');
const { DetectorType } = require('../../../../../lib/domain/enums/DetectorTypes.js');

module.exports = () => {
    it('should successfully retrieve a list of detectors and create the missing ones', async () => {
        const detectors = await getOrCreateAllDataTakingDetectorsByName(['CPV', 'A-NEW-ONE']);
        expect(detectors).to.length(2);
        expect(detectors.map(({ name, type }) => ({ name, type }))).to.have.all.deep.members([
            { name: 'CPV', type: DetectorType.PHYSICAL },
            { name: 'A-NEW-ONE', type: DetectorType.PHYSICAL },
        ]);

        const aNewDetector = detectors.find(({ name }) => name === 'A-NEW-ONE');
        await DetectorRepository.update(aNewDetector, { type: DetectorType.OTHER });
        const [{ name, type }] = await getOrCreateAllDataTakingDetectorsByName(['A-NEW-ONE']);
        expect({ name, type }).to.be.eql({ name: 'A-NEW-ONE', type: DetectorType.PHYSICAL });
    });

    it('should successfully do nothing with an empty list of detectors', async () => {
        const detectors = await getOrCreateAllDataTakingDetectorsByName([]);
        expect(detectors).to.length(0);
    });
};
