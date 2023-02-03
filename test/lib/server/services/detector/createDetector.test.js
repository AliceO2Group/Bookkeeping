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
const assert = require('assert');
const { createDetector } = require('../../../../../lib/server/services/detector/createDetector.js');
const { getDetector } = require('../../../../../lib/server/services/detector/getDetector.js');
const { ConflictError } = require('../../../../../lib/server/errors/ConflictError.js');

module.exports = () => {
    it('should successfully create a detector and return the corresponding ID', async () => {
        const detectorId = await createDetector({ name: 'A-NEW-DETECTOR' });
        expect((await getDetector({ detectorId })).name).to.equal('A-NEW-DETECTOR');
    });

    it('should throw when trying to create a detector with an already existing name', async () => {
        await assert.rejects(
            () => createDetector({ name: 'A-NEW-DETECTOR' }),
            new ConflictError('A detector already exists with name A-NEW-DETECTOR'),
        );
    });
};
