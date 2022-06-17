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

const { run: { GetRunUseCase } } = require('../../../lib/usecases');
const { dtos: { GetRunDto } } = require('../../../lib/domain');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    let getRunDto;

    beforeEach(async () => {
        getRunDto = await GetRunDto.validateAsync({
            params: {
                runId: 1,
            },
        });
    });

    it('should return an object that has the `id` property', async () => {
        const result = await new GetRunUseCase()
            .execute(getRunDto);

        expect(result).to.have.ownProperty('id');
        expect(result.id).to.equal(1);
    });

    it('should return an object that has the `id` property and includes tags and eorReasons', async () => {
        const result = await new GetRunUseCase()
            .execute(getRunDto);

        expect(result).to.have.ownProperty('id');
        expect(result.id).to.equal(1);
        expect(result.tags.length).to.equal(0);
        expect(result.eorReasons.length).to.equal(2);
        expect(result.eorReasons[0].category).to.equal('DETECTORS');
        expect(result.eorReasons[0].title).to.equal('CPV');
    });

    it('should successfully return an object that contain a null duration if trigger-start is not defined', async () => {
        getRunDto.params.runId = 103;
        let result = await new GetRunUseCase().execute(getRunDto);

        expect(result.timeTrgStart).to.equal(null);
        expect(result.triggerDuration).to.equal(null);

        getRunDto.params.runId = 104;
        result = await new GetRunUseCase().execute(getRunDto);

        expect(result.timeTrgStart).to.be.null;
        expect(result.triggerDuration).to.be.null;
    });

    it(
        'should successfully return an object that use the current timestamp as value if trigger-end is not defined to compute duration',
        async () => {
            getRunDto.params.runId = 105;
            const now = new Date();
            const result = await new GetRunUseCase().execute(getRunDto);

            expect(result.timeTrgStart).to.be.not.null;
            expect(result.timeTrgEnd).to.be.null;
            expect(result.triggerDuration).to.be.approximately(now.getTime() - result.timeTrgStart, 100);
        },
    );

    it('should successfully return an object that contain a duration coherent with its trigger start and end value', async () => {
        getRunDto.params.runId = 106;
        const result = await new GetRunUseCase().execute(getRunDto);

        expect(result.timeTrgStart).to.be.not.null;
        expect(result.timeTrgEnd).to.be.not.null;
        expect(result.triggerDuration).to.equal(result.timeTrgEnd - result.timeTrgStart);
    });
};
