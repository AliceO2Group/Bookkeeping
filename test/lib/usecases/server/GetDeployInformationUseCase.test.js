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

const { server: { GetDeployInformationUseCase } } = require('../../../../lib/usecases/index.js');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    it('should return an object that has the `age` property', async () => {
        // Arrange
        const usecase = new GetDeployInformationUseCase();

        // Act
        const result = await usecase.execute();

        // Assert
        expect(result).to.have.ownProperty('age');
    });

    it('should return an object that has the `start` property', async () => {
        // Arrange
        const usecase = new GetDeployInformationUseCase();

        // Act
        const result = await usecase.execute();

        // Assert
        expect(result).to.have.ownProperty('start');
    });
};
