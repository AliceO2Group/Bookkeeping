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

const { server: { GetServerInformationUseCase } } = require('../../../../lib/application/usecases');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    it('should return an object that has the `version` property', async () => {
        // Arrange
        const usecase = new GetServerInformationUseCase();

        // Act
        const result = await usecase.execute();

        // Assert
        expect(result).to.have.ownProperty('version');
    });

    it('should return an object that has the `name` property', async () => {
        // Arrange
        const usecase = new GetServerInformationUseCase();

        // Act
        const result = await usecase.execute();

        // Assert
        expect(result).to.have.ownProperty('name');
    });
};
