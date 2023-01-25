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

const { run: { GetAllReasonTypesUseCase } } = require('../../../../lib/usecases/index.js');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    it('should successfully return a list of reason types objects', async () => {
        const result = await new GetAllReasonTypesUseCase()
            .execute();

        expect(result).to.be.an('array');
        expect(result).to.have.lengthOf(4);
    });
};
