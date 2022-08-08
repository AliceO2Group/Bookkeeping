/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */
const { run: { EndRunUseCase } } = require('../../../lib/usecases');
const { dtos: { EndRunDto } } = require('../../../lib/domain');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    const wrongId = 9999999999;
    const dateValue = new Date('1-1-2021').setHours(0, 0, 0, 0);
    let endRunDto;
    beforeEach(async () => {
        endRunDto = await EndRunDto.validateAsync({
            params: {
                runId: '1',
            },
            body: {
                timeO2End: dateValue,
                timeO2Start: dateValue,
                timeTrgStart: dateValue,
                timeTrgEnd: dateValue,
                pdpConfigOption: 'Repository hash',
                pdpTopologyDescriptionLibraryFile: 'production/production.desc',
                tfbDdMode: 'processing',
                lhcPeriod: 'lhc22_b',
                triggerValue: 'CTP',
                odcTopologyFullName: 'synchronous-workflow',
            },
        });

        endRunDto.session = {
            personid: 1,
            id: 1,
            name: 'John Doe',
        };
    });
    it('Should be able to update the environment with correct values', async () => {
        const { result } = await new EndRunUseCase()
            .execute(endRunDto);
        expect(result.timeO2Start).to.equal(dateValue);
        expect(result.timeO2End).to.equal(dateValue);
        expect(result.timeTrgStart).to.equal(dateValue);
        expect(result.timeTrgEnd).to.equal(dateValue);
        expect(result.pdpConfigOption).to.equal('Repository hash');
        expect(result.pdpTopologyDescriptionLibraryFile).to.equal('production/production.desc');
        expect(result.tfbDdMode).to.equal('processing');
        expect(result.lhcPeriod).to.equal('lhc22_b');
        expect(result.triggerValue).to.equal('CTP');
        expect(result.odcTopologyFullName).to.equal('synchronous-workflow');
    });

    it('Should give an error when the id of the environment can not be found', async () => {
        endRunDto.params.runId = wrongId;
        const { error } = await new EndRunUseCase()
            .execute(endRunDto);
        expect(error.status).to.equal('400');
        expect(error.title).to.equal(`run with this id (${wrongId}) could not be found`);
    });
};
