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

const { lhcFill: { UpdateLhcFillUseCase } } = require('../../../../lib/usecases/index.js');
const { dtos: { UpdateLhcFillDto } } = require('../../../../lib/domain/index.js');
const chai = require('chai');
const { getLhcFill } = require('../../../../lib/server/services/lhcFill/getLhcFill.js');
const { getRun } = require('../../../../lib/server/services/run/getRun.js');
const { RunDefinition } = require('../../../../lib/server/services/run/getRunDefinition.js');

const { expect } = chai;

module.exports = () => {
    const wrongId = '9999999999';

    let updateLhcFillDto;

    beforeEach(async () => {
        updateLhcFillDto = await UpdateLhcFillDto.validateAsync({
            params: {
                fillNumber: '1',
            },
            body: {
                stableBeamsStart: new Date('2022-03-21 13:00:00'),
                stableBeamsEnd: new Date('2022-03-22 15:00:00'),
                stableBeamsDuration: 600,
                beamType: 'Pb-Pb',
                fillingSchemeName: 'schemename',
            },
        });

        updateLhcFillDto.session = {
            personid: 1,
            id: 1,
            name: 'John Doe',
        };
    });

    it('Should be able to update the LHC fill with correct values', async () => {
        const { result } = await new UpdateLhcFillUseCase().execute(updateLhcFillDto);
        expect(result.stableBeamsStart).to.equal(new Date('2022-03-21 13:00:00 utc').getTime());
        expect(result.stableBeamsEnd).to.equal(new Date('2022-03-22 15:00:00 utc').getTime());
        expect(result.stableBeamsDuration).to.equal(600);
        expect(result.beamType).to.equal('Pb-Pb');
        expect(result.fillingSchemeName).to.equal('schemename');
    });

    it('Should give an error when the id of the LHC fill can not be found', async () => {
        updateLhcFillDto.params.fillNumber = wrongId;
        const { error } = await new UpdateLhcFillUseCase().execute(updateLhcFillDto);
        expect(error.status).to.equal('400');
        expect(error.title).to.equal(`LhcFill with this id (${wrongId}) could not be found`);
    });

    it('Should successfully update the definition of related runs', async () => {
        let run = await getRun({ runNumber: 55 });
        expect(run.definition).to.equal(RunDefinition.Physics);
        const { stableBeamsStart, stableBeamsEnd } = await getLhcFill(6);

        const { result } = await new UpdateLhcFillUseCase().execute({
            params: {
                fillNumber: '6',
            },
            body: {
                stableBeamsStart: new Date('2022-03-21 13:00:00'),
                stableBeamsEnd: new Date('2022-03-22 15:00:00'),
            },
        });
        expect(result.stableBeamsStart).to.equal(new Date('2022-03-21 13:00:00 utc').getTime());
        expect(result.stableBeamsEnd).to.equal(new Date('2022-03-22 15:00:00 utc').getTime());
        run = await getRun({ runNumber: 55 });
        expect(run.definition).to.equal(RunDefinition.Commissioning);
        await new UpdateLhcFillUseCase().execute({
            params: {
                fillNumber: 6,
            },
            body: {
                stableBeamsStart,
                stableBeamsEnd,
            },
        });
        run = await getRun({ runNumber: 55 });
        expect(run.definition).to.equal(RunDefinition.Physics);
    });
};
