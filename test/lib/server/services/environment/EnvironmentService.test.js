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

const assert = require('assert');
const { environmentService } = require('../../../../../lib/server/services/environment/EnvironmentService.js');
const { expect } = require('chai');
const { BadParameterError } = require('../../../../../lib/server/errors/BadParameterError');
const { resetDatabaseContent } = require('../../../../utilities/resetDatabaseContent.js');
const { NotFoundError } = require('../../../../../lib/server/errors/NotFoundError.js');

module.exports = () => {
    before(async () => {
        await resetDatabaseContent();
    });

    const environmentId = 'A-NEW-ENVIRONMENT';

    it('should successfully return an environment extracted by its id with the related runs and history items', async () => {
        {
            const environment = await environmentService.get('Dxi029djX');
            expect(environment).to.have.ownProperty('id');
            expect(environment.id).to.equal('Dxi029djX');
            expect(environment.historyItems).to.lengthOf(1);
            expect(environment.historyItems[0].id).to.equal(1);
        }

        {
            const environment = await environmentService.getOrFail('Dxi029djX');
            expect(environment).to.have.ownProperty('id');
            expect(environment.id).to.equal('Dxi029djX');
            expect(environment.historyItems).to.lengthOf(1);
            expect(environment.historyItems[0].id).to.equal(1);
        }
    });

    it('should successfully return null when trying to fetch a non-existing environment using get', async () => {
        const environment = await environmentService.get('999999999');
        expect(environment).to.be.null;
    });

    it('should throw an error when trying to fetch a non-existing environment using getOrFail', async () => {
        await assert.rejects(
            () => environmentService.getOrFail('999999999'),
            new NotFoundError('Environment with this id (999999999) could not be found'),
        );
    });

    it('should successfully create a new environment with an initial state', async () => {
        const status = 'STANDBY';
        const statusMessage = 'Environment has been created';

        const environment = await environmentService.create(
            { id: environmentId },
            { status, statusMessage },
        );

        const { historyItems } = environment;

        expect(historyItems).to.be.an('array');
        expect(historyItems).to.have.a.lengthOf(1);

        const [firstHistoryItem] = historyItems;

        expect(firstHistoryItem.status).to.equal(status);
        expect(firstHistoryItem.statusMessage).to.equal(statusMessage);
    });

    it('should throw when trying to create an environment with an invalid initial state', async () => {
        await assert.rejects(
            () => environmentService.create({ id: 'A-NEW-NEW-ENVIRONMENT' }, { status: 'DO-NOT-EXIST' }),
            new BadParameterError('"status" must be one of [STANDBY, DEPLOYED, CONFIGURED, RUNNING, ERROR, MIXED, DESTROYED, PENDING]'),
        );

        await assert.rejects(
            () => environmentService.create({ id: 'A-NEW-NEW-ENVIRONMENT' }, { statusMessage: 'I forgot the actual status' }),
            new BadParameterError('"status" is required'),
        );
    });

    it('should successfully update the environment\'s history when updating the environment\'s state', async () => {
        const status = 'CONFIGURED';
        const statusMessage = 'The environment has been successfully configured';

        const environment = await environmentService.update(environmentId, {}, { status, statusMessage });

        const { historyItems } = environment;

        expect(historyItems).to.be.an('array');
        expect(historyItems).to.have.a.lengthOf(2);

        const [, lastHistoryItem] = historyItems;

        expect(lastHistoryItem.status).to.equal(status);
        expect(lastHistoryItem.statusMessage).to.equal(statusMessage);
    });
};
