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

const { run: { GetRunUseCase } } = require('../../../../lib/usecases/index.js');
const { dtos: { GetRunDto } } = require('../../../../lib/domain/index.js');
const chai = require('chai');
const { RunDetectorQualities } = require('../../../../lib/domain/enums/RunDetectorQualities.js');

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

    it('should return an object that has the `id` property and includes tags, eorReasons and detectors qualities', async () => {
        const result = await new GetRunUseCase()
            .execute(getRunDto);

        expect(result).to.have.ownProperty('id');
        expect(result.id).to.equal(1);
        expect(result.tags.length).to.equal(0);
        expect(result.eorReasons.length).to.equal(2);
        expect(result.eorReasons[0].category).to.equal('DETECTORS');
        expect(result.eorReasons[0].title).to.equal('CPV');
        expect(result.lhcPeriod).to.equal('lhc22b');
        expect(result.odcTopologyFullName).to.equal('hash');
        expect(result.runType.id).to.equal(14);
        expect(result.detectorsQualities.length).to.equal(1);
        expect(result.detectorsQualities[0].id).to.equal(1);
        expect(result.detectorsQualities[0].name).to.equal('CPV');
        expect(result.detectorsQualities[0].quality).to.equal(RunDetectorQualities.GOOD);
    });

    it('should successfully return detectors qualities sorted alphabetically', async () => {
        const result = await new GetRunUseCase().execute({ params: { runId: 106 } });
        expect(result.detectorsQualities.length).to.be.greaterThan(1);
        const qualities = [...result.detectorsQualities];
        qualities.sort(({ name: name1 }, { name: name2 }) => name1.localeCompare(name2));
        expect(result.detectorsQualities).to.be.eql(qualities);
    });

    it('should successfully return an object that contains a null duration if trigger start and o2start is not defined', async () => {
        getRunDto.params.runId = 100;
        const result = await new GetRunUseCase().execute(getRunDto);

        expect(result.timeTrgStart).to.equal(null);
        expect(result.timeO2Start).to.be.null;

        expect(result.runDuration).to.equal(null);
    });

    it(
        'should successfully return an object that use the current timestamp as value if trigger-end is not defined to compute duration',
        async () => {
            getRunDto.params.runId = 105;
            const now = new Date();
            const result = await new GetRunUseCase().execute(getRunDto);

            expect(result.timeTrgStart).to.be.not.null;
            expect(result.timeTrgEnd).to.be.null;
            expect(result.runDuration).to.be.approximately(now.getTime() - result.timeTrgStart, 100);
        },
    );

    it('should successfully return an object that contain a duration coherent with its trigger start and end value', async () => {
        getRunDto.params.runId = 106;
        const result = await new GetRunUseCase().execute(getRunDto);

        expect(result.timeTrgStart).to.be.not.null;
        expect(result.timeTrgEnd).to.be.not.null;
        expect(result.detectors).to.equal('ACO,CPV,CTP,EMC,FIT,HMP,ITS,MCH,MFT,MID,PHS,TOF,TPC,TRD,ZDC');
        expect(result.runDuration).to.equal(result.timeTrgEnd - result.timeTrgStart);
    });
};
