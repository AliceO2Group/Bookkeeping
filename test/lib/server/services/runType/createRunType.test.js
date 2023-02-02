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
const { getRunType } = require('../../../../../lib/server/services/runType/getRunType.js');
const { createRunType } = require('../../../../../lib/server/services/runType/createRunType.js');
const assert = require('assert');
const { ConflictError } = require('../../../../../lib/server/errors/ConflictError.js');

module.exports = () => {
    it('should successfully create a run type and return the corresponding ID', async () => {
        const id = await createRunType({ name: 'A-NEW-RUN-TYPE' });
        expect((await getRunType({ id })).name).to.equal('A-NEW-RUN-TYPE');
    });

    it('should throw an error when trying to create a run type with an already existing name', async () => {
        await assert.rejects(
            () => createRunType({ name: 'A-NEW-RUN-TYPE' }),
            new ConflictError('A run type already exists with name A-NEW-RUN-TYPE'),
        );
    });
};
