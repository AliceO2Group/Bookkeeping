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
const { getMockMonALISAClient } = require('./data/getMockMonALISAClient.js');
const Joi = require('joi');

const dataPassSchema = Joi.object({
    name: Joi.string(),
    reconstructedEventsCount: Joi.number(),
    description: Joi.string(),
    outputSize: Joi.number(),
    lastRunNumber: Joi.number(),

});

const simulationPassSchema = Joi.object({
    properties: Joi.object({
        name: Joi.string(),
        jiraId: Joi.string(),
        description: Joi.string(),
        pwg: Joi.string(),
        requestedEventsCount: Joi.number(),
        generatedEventsCount: Joi.number(),
        outputSize: Joi.number(),
    }),
    associations: Joi.object({
        runNumbers: Joi.array().items(Joi.number()),
        dataPassesSuffixes: Joi.array().items(Joi.string()),
        lhcPeriods: Joi.array().items(Joi.string()),
    }),

});

module.exports = () => {
    it('Should get data passes with respect to given year limit (2022) and in correct format', async () => {
        const monALISAInterface = getMockMonALISAClient(2022);
        const dataPasses = await monALISAInterface.getDataPasses();

        expect(dataPasses).to.be.an('array');
        expect(dataPasses).to.be.lengthOf(12);
        for (const dataPass of dataPasses) {
            await dataPassSchema.validateAsync(dataPass);
        }
    });

    it('Should get data passes with respect to given year limit (2023) and in correct format', async () => {
        const monALISAInterface = getMockMonALISAClient(2023);
        const dataPasses = await monALISAInterface.getDataPasses();

        expect(dataPasses).to.be.an('array');
        expect(dataPasses).to.be.lengthOf(5);
        for (const dataPass of dataPasses) {
            await dataPassSchema.validateAsync(dataPass);
        }
    });

    it('Should get simultion passes with respect to given year limit (2022) and in correct format', async () => {
        const monALISAInterface = getMockMonALISAClient(2022);
        const simulationPasses = await monALISAInterface.getSimulationPasses();

        expect(simulationPasses).to.be.an('array');
        expect(simulationPasses).to.be.lengthOf(10);
        for (const simulationPass of simulationPasses) {
            await simulationPassSchema.validateAsync(simulationPass);
        }
    });
};
