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
const { Op } = require('sequelize');
const DataPassRepository = require('../../../../../lib/database/repositories/DataPassRepository.js');
const { runService } = require('../../../../../lib/server/services/run/RunService.js');
const RunRepository = require('../../../../../lib/database/repositories/RunRepository.js');

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

    it('should successfully set default GAQ detectors', async () => {
        /**
         * Default GAQ detectors for runs with given pdpBeamType
         *      pp: ['TPC', 'ITS', 'FT0']
         *      PbPb: ['TPC', 'ITS', 'FT0', 'ZDC']
         */

        const newRuns = [
            { runNumber: 777770, pdpBeamType: 'pp', detectors: ['CPV', 'TPC', 'ITS', 'FT0'].join(',') },
            { runNumber: 777771, pdpBeamType: 'pp', detectors: ['CPV', 'TPC', 'ITS'].join(',') },
            { runNumber: 888880, pdpBeamType: 'PbPb', detectors: ['CPV', 'TPC', 'ITS', 'FT0', 'ZDC'].join(',') },
            { runNumber: 888881, pdpBeamType: 'PbPb', detectors: ['CPV', 'TPC', 'ITS', 'FT0'].join(',') },
        ];
        for (const runData of newRuns) {
            await runService.create(runData);
        }
        const dataPassId = 3;
        const dataPass = await DataPassRepository.findOne({ where: { id: dataPassId } });
        const runNumbers = newRuns.map(({ runNumber }) => runNumber);

        await dataPass.addRuns(await RunRepository.findAll({ where: { runNumber: { [Op.in]: runNumbers } } }));

        expect((await gaqDetectorService.getGaqDetectors(dataPassId, 777770)).map(({ name }) => name)).to
            .have.all.members(['TPC', 'ITS', 'FT0']);
        expect((await gaqDetectorService.getGaqDetectors(dataPassId, 777771)).map(({ name }) => name)).to
            .have.all.members(['TPC', 'ITS']);
        expect((await gaqDetectorService.getGaqDetectors(dataPassId, 888880)).map(({ name }) => name)).to
            .have.all.members(['TPC', 'ITS', 'FT0', 'ZDC']);
        expect((await gaqDetectorService.getGaqDetectors(dataPassId, 888881)).map(({ name }) => name)).to
            .have.all.members(['TPC', 'ITS', 'FT0']);
    });
};
