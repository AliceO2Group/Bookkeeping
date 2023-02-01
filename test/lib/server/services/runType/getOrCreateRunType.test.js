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
const { getOrCreateRunType: getOrCreateRunTypeTest } = require('../../../../../lib/server/services/runType/getOrCreateRunType.js');

module.exports = () => {
    it('should successfully retrieve a given run type and create it if it does not exist', async () => {
        const runType = await getOrCreateRunTypeTest({ name: 'A-NEW-ONE' });
        expect(runType.name).to.equal('A-NEW-ONE');
    });
};
