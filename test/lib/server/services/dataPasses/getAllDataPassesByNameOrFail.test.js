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
const { NotFoundError } = require('../../../../../lib/server/errors/NotFoundError.js');
const {
    getAllDataPassesByNameOrFail,
} = require('../../../../../lib/server/services/dataPasses/getAllDataPassesByNameOrFail.js');

module.exports = () => {
    it('should successfully return the data passes matching the given names', async () => {
        const dataPasses = await getAllDataPassesByNameOrFail(['LHC22b_apass1', 'LHC22b_skimming']);

        expect(dataPasses.map(({ name }) => name)).to.deep.equal(['LHC22b_apass1', 'LHC22b_skimming']);
    });

    it('should return an empty list when no names are given', async () => {
        expect(await getAllDataPassesByNameOrFail([])).to.deep.equal([]);
        expect(await getAllDataPassesByNameOrFail(undefined)).to.deep.equal([]);
    });

    it('should throw when one of the data passes can not be found', async () => {
        await assert.rejects(
            () => getAllDataPassesByNameOrFail(['LHC22b_apass1', 'NOT_A_DATA_PASS']),
            new NotFoundError('Data pass with this name (NOT_A_DATA_PASS) could not be found'),
        );
    });

    it('should throw listing every missing data pass', async () => {
        await assert.rejects(
            () => getAllDataPassesByNameOrFail(['LHC22b_apass1', 'MISSING_1', 'MISSING_2']),
            new NotFoundError('Data passes with these names (MISSING_1, MISSING_2) could not be found'),
        );
    });
};
