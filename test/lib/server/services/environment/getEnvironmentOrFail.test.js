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
const { expect } = require('chai');
const { getEnvironmentOrFail } = require('../../../../../lib/server/services/environment/getEnvironmentOrFail.js');
const { NotFoundError } = require('../../../../../lib/server/errors/NotFoundError.js');

module.exports = () => {
    it('should successfully return an environment extracted by its id', async () => {
        const environment = await getEnvironmentOrFail('Dxi029djX');
        expect(environment?.id).to.equal('Dxi029djX');
    });

    it('should throw an error when trying to fetch a non-existing environment', async () => {
        await assert.rejects(
            () => getEnvironmentOrFail('999999999'),
            new NotFoundError('Environment with this id (999999999) could not be found'),
        );
    });
};
