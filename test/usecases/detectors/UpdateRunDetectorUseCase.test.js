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

const { runDetector: { UpdateRunDetectorUseCase } } = require('../../../lib/usecases');
const { dtos: { UpdateRunDetectorDto } } = require('../../../lib/domain');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    const wrongId = 9999999999;

    let updateRunDetectorDto;

    beforeEach(async () => {
        updateRunDetectorDto = await UpdateRunDetectorDto.validateAsync({
            params: {
                runNumber: 106,
                detectorId: 1,
            },
            body: {
                quality: 'good',
            },
        });

        updateRunDetectorDto.session = {
            personid: 1,
            id: 1,
            name: 'John Doe',
        };
    });

    it('Should be able to update the environment with correct values', async () => {
        const { result } = await new UpdateRunDetectorUseCase()
            .execute(updateRunDetectorDto);
        expect(result.quality).to.equal('good');
    });

    it('Should give an error when the id of the environment can not be found', async () => {
        updateRunDetectorDto.params.runNumber = wrongId;
        const { error } = await new UpdateRunDetectorUseCase()
            .execute(updateRunDetectorDto);
        expect(error.status).to.equal(400);
        expect(error.title).to.equal(`RunDetector with this id (${wrongId}) could not be found`);
    });
};
