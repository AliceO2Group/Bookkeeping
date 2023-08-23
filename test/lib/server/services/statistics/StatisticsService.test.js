/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

const { statisticsService } = require('../../../../../lib/server/services/statistics/StatisticsService.js');
const { expect } = require('chai');

module.exports = () => {
    it('Should successfully extract fill statistics', async () => {
        const allStatistics = await statisticsService.getLhcFillStatistics({
            from: new Date('2019/08/08 10:00:00'),
            to: new Date('2019/08/09 01:00:00'),
        });
        expect(allStatistics).to.lengthOf(1);
        const [statistics] = allStatistics;
        expect(statistics.fillNumber).to.equal(6);
        expect(statistics.runsCoverage).to.equal(5 * 3600 * 1000);
        expect(statistics.efficiency).to.equal(0.4167);
        expect(statistics.timeLossAtStart).to.equal(3 * 3600 * 1000);
        expect(statistics.efficiencyLossAtStart).to.equal(0.25);
        expect(statistics.timeLossAtEnd).to.equal(2 * 3600 * 1000);
        expect(statistics.efficiencyLossAtEnd).to.equal(0.1667);
        expect(statistics.meanRunDuration).to.equal((3600 + 40 * 60) * 1000);
        expect(statistics.totalCtfFileSize).to.equal(67956862061);
        expect(statistics.totalTfFileSize).to.equal(741800696322);
    });

    it('should successfully filter out fills after a date, excluded', async () => {
        {
            const allStatistics = await statisticsService.getLhcFillStatistics({
                from: new Date('2019/08/08 10:00:00'),
                to: new Date('2019/08/08 11:00:01'),
            });
            expect(allStatistics).to.lengthOf(1);
        }
        {
            const allStatistics = await statisticsService.getLhcFillStatistics({
                from: new Date('2019/08/08 10:00:00'),
                to: new Date('2019/08/08 11:00:00'),
            });
            expect(allStatistics).to.lengthOf(0);
        }
    });

    it('should successfully filter out fills before a date, included', async () => {
        {
            const allStatistics = await statisticsService.getLhcFillStatistics({
                from: new Date('2019/08/08 22:59:59'),
                to: new Date('2019/08/09 01:00:00'),
            });
            expect(allStatistics).to.lengthOf(1);
        }
        {
            const allStatistics = await statisticsService.getLhcFillStatistics({
                from: new Date('2019/08/08 23:00:01'),
                to: new Date('2019/08/09 01:00:00'),
            });
            expect(allStatistics).to.lengthOf(0);
        }
    });
};
