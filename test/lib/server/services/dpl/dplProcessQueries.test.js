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
const {
    getDplDetectorIdsWithExecutedProcessesInRun,
} = require('../../../../../lib/server/services/dpl/getDplDetectorIdsWithExecutedProcessesInRun.js');
const { getAllDplDetectors } = require('../../../../../lib/server/services/dpl/getAllDplDetectors.js');
const {
    getDplProcessIdsExecutedInRunByDetector,
} = require('../../../../../lib/server/services/dpl/getDplProcessIdsExecutedInRunByDetector.js');
const { getAllDplProcesses } = require('../../../../../lib/server/services/dpl/getAllDplProcesses.js');
const { getHostIdsWithExecutedDplProcess } = require('../../../../../lib/server/services/dpl/getHostIdsWithExecutedDplProcess.js');
const { getAllHosts } = require('../../../../../lib/server/services/host/getAllHosts.js');
const { getAllDplProcessExecutions } = require('../../../../../lib/server/services/dpl/getAllDplProcessExecutions.js');

module.exports = () => {
    describe('getDplDetectorIdsWithExecutedProcessesInRun', () => {
        it('should return the ids of the detectors having an executed process in the run, sorted by name', async () => {
            expect(await getDplDetectorIdsWithExecutedProcessesInRun(106)).to.eql([1, 2]);
        });

        it('should return an empty list for a run without executed process', async () => {
            expect(await getDplDetectorIdsWithExecutedProcessesInRun(999)).to.eql([]);
        });
    });

    describe('getAllDplDetectors', () => {
        it('should return the detectors matching the query builder configuration', async () => {
            const detectors = await getAllDplDetectors((queryBuilder) => {
                queryBuilder.where('id').oneOf(1, 2);
                queryBuilder.orderBy('name', 'ASC');
            });

            expect(detectors.map(({ id }) => id)).to.eql([1, 2]);
        });

        it('should return all the detectors without configuration', async () => {
            expect((await getAllDplDetectors()).map(({ id }) => id)).to.include.members([1, 2]);
        });
    });

    describe('getDplProcessIdsExecutedInRunByDetector', () => {
        it('should return the ids of the processes executed in the run for the detector, sorted by name', async () => {
            expect(await getDplProcessIdsExecutedInRunByDetector(106, 1)).to.eql([1, 3, 2]);
        });

        it('should return an empty list when no process was executed for the detector', async () => {
            expect(await getDplProcessIdsExecutedInRunByDetector(106, 999)).to.eql([]);
        });
    });

    describe('getAllDplProcesses', () => {
        it('should return the processes matching the query builder configuration, with their type', async () => {
            const processes = await getAllDplProcesses((queryBuilder) => {
                queryBuilder.where('id').oneOf(1, 2, 3);
                queryBuilder.include({ association: 'type' });
                queryBuilder.orderBy('name', 'ASC');
            });

            expect(processes.map(({ id }) => id)).to.eql([1, 3, 2]);
            expect(processes.every(({ type }) => type !== null && typeof type === 'object')).to.be.true;
        });
    });

    describe('getHostIdsWithExecutedDplProcess', () => {
        it('should return the ids of the hosts on which the process was executed in the run for the detector', async () => {
            expect(await getHostIdsWithExecutedDplProcess(106, 1, 1)).to.have.members([1, 2]);
        });

        it('should return an empty list when the process was not executed for the detector', async () => {
            expect(await getHostIdsWithExecutedDplProcess(106, 999, 1)).to.eql([]);
        });
    });

    describe('getAllHosts', () => {
        it('should return the hosts matching the query builder configuration, sorted as asked', async () => {
            const getHostsIds = async (order) => (await getAllHosts((queryBuilder) => {
                queryBuilder.where('id').oneOf(1, 2);
                queryBuilder.orderBy('hostname', order);
            })).map(({ id }) => id);

            const ascendingIds = await getHostsIds('ASC');
            expect(ascendingIds).to.have.members([1, 2]);
            expect(ascendingIds).to.eql([...await getHostsIds('DESC')].reverse());
        });
    });

    describe('getAllDplProcessExecutions', () => {
        it('should return the executions matching the query builder configuration', async () => {
            const executions = await getAllDplProcessExecutions((queryBuilder) => {
                queryBuilder.where('runNumber').is(106);
            });

            expect(executions).to.not.be.empty;
            expect(executions.every(({ runNumber }) => runNumber === 106)).to.be.true;
        });
    });
};
