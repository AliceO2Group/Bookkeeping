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

const { resetDatabaseContent } = require('../../../../utilities/resetDatabaseContent.js');
const { createEnvironmentHistoryItem } = require('../../../../../lib/server/services/environmentHistoryItem/createEnvironmentHistoryItem.js');
const { expect } = require('chai');
const { getEnvironmentHistoryItem } = require('../../../../../lib/server/services/environmentHistoryItem/getEnvironmentHistoryItem.js');
const assert = require('assert');
const { ConflictError } = require('../../../../../lib/server/errors/ConflictError.js');
const { NotFoundError } = require('../../../../../lib/server/errors/NotFoundError.js');

module.exports = () => {
    before(async () => {
        await resetDatabaseContent();
    });

    it('should successfully create an environment history item', async () => {
        const environmentId = 'EIDO13i3D';
        const status = 'DESTROYED';
        const statusMessage = 'Environment has been destroyed';
        const timestamp = new Date('2024-09-06 10:40').getTime();
        const timestampNano = 123456789;

        const itemId = await createEnvironmentHistoryItem({ environmentId, status, statusMessage, timestamp, timestampNano });
        const item = await getEnvironmentHistoryItem(itemId);
        expect(item).to.be.an('object');
        expect(item.status).to.equal(status);
        expect(item.statusMessage).to.equal(statusMessage);
        expect(item.environmentId).to.equal(environmentId);
        expect(item.timestamp.getTime()).to.equal(timestamp);
        expect(item.timestampNano).to.equal(timestampNano);
    });

    it('should throw when trying to create an environment history item using an already existing id', async () => {
        await assert.rejects(
            () => createEnvironmentHistoryItem({ id: 1, environmentId: 'EIDO13i3D', timestamp: new Date(), timestampNano: 0 }),
            new ConflictError('An environment\'s history item already exists with id 1'),
        );
    });

    it('should throw when trying to create an environment history item for a non-existing environment id', async () => {
        await assert.rejects(
            () => createEnvironmentHistoryItem({ environmentId: 'I do not exist', timestamp: new Date(), timestampNano: 0 }),
            new NotFoundError('Environment with this id (I do not exist) could not be found'),
        );
    });
};
