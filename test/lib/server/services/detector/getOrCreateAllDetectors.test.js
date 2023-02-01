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
const { getOrCreateAllDetectorsByName } = require('../../../../../lib/server/services/detector/getOrCreateAllDetectorsByName.js');

module.exports = () => {
    it('should successfully retrieve a list of detectors and create the missing ones', async () => {
        const detectors = await getOrCreateAllDetectorsByName(['CPV', 'A-NEW-ONE']);
        expect(detectors).to.length(2);
        expect(detectors.map(({ name }) => name)).to.eql(['CPV', 'A-NEW-ONE']);
    });
};
