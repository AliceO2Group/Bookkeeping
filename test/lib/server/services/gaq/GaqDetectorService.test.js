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
const { resetDatabaseContent } = require('../../../../utilities/resetDatabaseContent.js');
const assert = require('assert');
const { gaqDetectorService } = require('../../../../../lib/server/services/dataPasses/DataPassService.js');
const { BadParameterError } = require('../../../../../lib/server/errors/BadParameterError.js');
const { DetectorType } = require('../../../../../lib/domain/enums/DetectorTypes.js');

module.exports = () => {
    before(resetDatabaseContent);
    const dataPassId = 3;
    it('should successfully set GAQ detectors', async () => {
        const runNumbers = [49, 56];
        const detectorIds = [4, 7];
        const data = await gaqDetectorService.setGaqDetectors(dataPassId, runNumbers, detectorIds);
        expect(data).to.be.have.all.deep.members(runNumbers
            .flatMap((runNumber) => detectorIds.map((detectorId) => ({ dataPassId, runNumber, detectorId }))));
    });
    it('should fail to set GAQ detectors because of missing association', async () => {
        let errorMessage = `No association between data pass with id ${dataPassId} and following runs: 1`;
        assert.rejects(
            () => gaqDetectorService.setGaqDetectors(dataPassId, [1], [4]),
            new BadParameterError(errorMessage),
        );
        errorMessage = `No association between runs and detectors: ${JSON.stringify([[56, 'CPV']])}`;
        assert.rejects(
            () => gaqDetectorService.setGaqDetectors(dataPassId, [105, 56], [1]),
            new BadParameterError(errorMessage),
        );
    });

    it('should get GAQ detectors', async () => {
        const detectors = await gaqDetectorService.getGaqDetectors(3, 56);
        expect(detectors).to.be.an('array');
        expect(detectors).to.be.lengthOf(2);
        expect(detectors).to.have.all.deep.members([
            { id: 7, name: 'FT0', type: DetectorType.PHYSICAL },
            { id: 4, name: 'ITS', type: DetectorType.PHYSICAL },
        ]);
    });
};
