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
const { getAllGaqDetectors } = require('../../../../../lib/server/services/gaq/getAllGaqDetectors.js');
const { createGaqDetectors } = require('../../../../../lib/server/services/gaq/createGaqDetectors.js');
const { removeGaqDetectors } = require('../../../../../lib/server/services/gaq/removeGaqDetectors.js');
const { getRunNumbersLinkedToDataPass } = require('../../../../../lib/server/services/gaq/getRunNumbersLinkedToDataPass.js');
const { getRunsWithDetectorsByIds } = require('../../../../../lib/server/services/gaq/getRunsWithDetectorsByIds.js');
const { getRunsWithDefaultGaqDetectors } = require('../../../../../lib/server/services/gaq/getRunsWithDefaultGaqDetectors.js');
const { runService } = require('../../../../../lib/server/services/run/RunService.js');

const DATA_PASS_ID = 3;

/**
 * Return the GAQ detectors entries of a run for the data pass used in the tests
 *
 * @param {number} runNumber the run number
 * @return {Promise<SequelizeGaqDetector[]>} the entries
 */
const getEntriesOfRun = (runNumber) => getAllGaqDetectors((queryBuilder) => {
    queryBuilder.where('dataPassId').is(DATA_PASS_ID);
    queryBuilder.where('runNumber').is(runNumber);
});

module.exports = () => {
    describe('getAllGaqDetectors, createGaqDetectors and removeGaqDetectors', () => {
        it('should successfully remove, create and find the GAQ detectors entries of a run', async () => {
            await removeGaqDetectors(DATA_PASS_ID, [49]);
            expect(await getEntriesOfRun(49)).to.eql([]);

            const created = await createGaqDetectors([
                { dataPassId: DATA_PASS_ID, runNumber: 49, detectorId: 4 },
                { dataPassId: DATA_PASS_ID, runNumber: 49, detectorId: 7 },
            ]);
            expect(created).to.lengthOf(2);

            const entries = await getEntriesOfRun(49);
            expect(entries.map(({ detectorId }) => detectorId)).to.have.members([4, 7]);

            await removeGaqDetectors(DATA_PASS_ID, [49]);
            expect(await getEntriesOfRun(49)).to.eql([]);
        });
    });

    describe('getRunNumbersLinkedToDataPass', () => {
        it('should return only the run numbers of the runs linked to the data pass', async () => {
            expect(await getRunNumbersLinkedToDataPass(DATA_PASS_ID, [49, 56, 1])).to.have.members([49, 56]);
        });

        it('should return an empty list when no run is linked to the data pass', async () => {
            expect(await getRunNumbersLinkedToDataPass(DATA_PASS_ID, [1])).to.eql([]);
        });
    });

    describe('getRunsWithDetectorsByIds', () => {
        it('should return the runs with only the requested detectors', async () => {
            const [run] = await getRunsWithDetectorsByIds([56], [4, 7]);

            expect(run.runNumber).to.equal(56);
            expect(run.detectors.map(({ name }) => name)).to.have.members(['ITS', 'FT0']);
        });

        it('should return the runs with no detectors when they have none of the requested ones', async () => {
            const [run] = await getRunsWithDetectorsByIds([56], [1]);

            expect(run.runNumber).to.equal(56);
            expect(run.detectors).to.eql([]);
        });
    });

    describe('getRunsWithDefaultGaqDetectors', () => {
        it('should return the runs with only the default GAQ detectors of their PDP beam type', async () => {
            await runService.create({ runNumber: 777780, pdpBeamType: 'pp', detectors: 'CPV,TPC,ITS' });
            await runService.create({ runNumber: 777781, pdpBeamType: 'PbPb', detectors: 'CPV,TPC,ZDC' });
            // None of its detectors is a default one: the run is not returned
            await runService.create({ runNumber: 777782, pdpBeamType: 'pp', detectors: 'CPV' });

            const runs = await getRunsWithDefaultGaqDetectors([777780, 777781, 777782], { pp: ['TPC', 'FT0'], PbPb: ['ZDC'] });
            const detectorsNamesByRun = Object.fromEntries(
                runs.map(({ runNumber, detectors }) => [runNumber, detectors.map(({ name }) => name)]),
            );

            expect(detectorsNamesByRun).to.eql({ 777780: ['TPC'], 777781: ['ZDC'] });
        });
    });
};
