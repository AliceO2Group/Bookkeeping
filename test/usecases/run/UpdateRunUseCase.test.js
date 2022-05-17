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

const { run: { UpdateRunUseCase, GetRunUseCase } } = require('../../../lib/usecases');
const { dtos: { UpdateRunDto, GetRunDto } } = require('../../../lib/domain');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    let updateRunDto;
    let getRunDto;

    beforeEach(async () => {
        updateRunDto = await UpdateRunDto.validateAsync({
            body: {
                runQuality: 'test',
            },
            params: {
                runId: 106,
            },
        });
        getRunDto = await GetRunDto.validateAsync({
            params: {
                runId: 106,
            },
        });
    });

    it('should successfully retrieve run via ID, store and return the new run with runQuality passed as to update fields', async () => {
        const run = await new GetRunUseCase().execute(getRunDto);
        expect(run).to.be.an('object');
        expect(run.id).to.equal(106);
        expect(run.runQuality).to.equal('good');

        const { result, error } = await new UpdateRunUseCase().execute(updateRunDto);

        expect(error).to.be.an('undefined');
        expect(result).to.be.an('object');
        expect(result.id).to.equal(106);
        expect(result.runQuality).to.equal('test');
    });

    it('should successfully retrieve run via ID, store and return the new run with eorReasons passed as to update fields', async () => {
        getRunDto.params.runId = 1;
        const run = await new GetRunUseCase().execute(getRunDto);
        expect(run).to.be.an('object');
        expect(run.id).to.equal(1);
        expect(run.eorReasons).to.have.lengthOf(2);
        expect(run.eorReasons[0].description).to.equal('Some Reason other than selected');

        updateRunDto.params.runId = 1;
        updateRunDto.body = {
            eorReasons: [
                {
                    description: 'Something went wrong',
                    runId: 1,
                    reasonTypeId: 1,
                    lastEditedName: 'Anonymous',
                },
            ],
        };
        const { result, error } = await new UpdateRunUseCase().execute(updateRunDto);

        expect(error).to.be.an('undefined');
        expect(result).to.be.an('object');
        expect(result.id).to.equal(1);
        expect(result.eorReasons).to.have.lengthOf(1);
        expect(result.eorReasons[0].description).to.equal('Something went wrong');
    });

    it('should return error if eor reasons do not match runId', async () => {
        updateRunDto.params.runId = 10;
        updateRunDto.body = {
            eorReasons: [
                {
                    description: 'Something went wrong',
                    runId: 1,
                    reasonTypeId: 1,
                    lastEditedName: 'Anonymous',
                },
            ],
        };
        const { result, error } = await new UpdateRunUseCase().execute(updateRunDto);

        expect(result).to.be.an('undefined');

        expect(error).to.be.an('object');
        expect(error.status).to.equal(400);
        expect(error.detail).to.equal('Multiple run ids parameters passed in eorReasons list. Please send updates for one run only');
    });

    it('should return error if eor reasons contain different runIds', async () => {
        updateRunDto.params.runId = 1;
        updateRunDto.body = {
            eorReasons: [
                {
                    description: 'Something went wrong',
                    runId: 1,
                    reasonTypeId: 1,
                    lastEditedName: 'Anonymous',
                },
                {
                    description: 'Something went wrong',
                    runId: 2,
                    reasonTypeId: 1,
                    lastEditedName: 'Anonymous',
                },
            ],
        };
        const { result, error } = await new UpdateRunUseCase().execute(updateRunDto);

        expect(result).to.be.an('undefined');

        expect(error).to.be.an('object');
        expect(error.status).to.equal(400);
        expect(error.detail).to.equal('Multiple run ids parameters passed in eorReasons list. Please send updates for one run only');
    });

    it('should return error if eor reasons contains reason_type_id that does not exist', async () => {
        updateRunDto.params.runId = 1;
        updateRunDto.body = {
            eorReasons: [
                {
                    description: 'Something went wrong',
                    runId: 1,
                    reasonTypeId: 10,
                    lastEditedName: 'Anonymous',
                },
            ],
        };
        const { result, error } = await new UpdateRunUseCase().execute(updateRunDto);

        expect(result).to.be.an('undefined');

        expect(error).to.be.an('object');
        expect(error.status).to.equal(400);
        expect(error.detail).to.equal('Provided reason types do not exist');
    });
};
