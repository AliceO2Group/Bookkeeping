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

const { statisticsService } = require('../../../../../backend/server/services/statistics/StatisticsService.js');
const { expect } = require('chai');

module.exports = () => {
    it('Should successfully extract fill statistics', async () => {
        const allStatistics = await statisticsService.getLhcFillStatistics({
            from: new Date('2019/08/08 10:00:00').getTime(),
            to: new Date('2023/08/09 01:00:00').getTime(),
        });
        expect(allStatistics).to.lengthOf(4);
        // eslint-disable-next-line no-unused-vars
        const [fill1, _fill2, _fill3, fill6] = allStatistics;
        expect(fill6.fillNumber).to.equal(6);
        expect(fill6.runsCoverage).to.equal(5 * 3600 * 1000);
        expect(fill6.efficiency).to.equal(0.4167);
        expect(fill6.timeLossAtStart).to.equal(3 * 3600 * 1000);
        expect(fill6.efficiencyLossAtStart).to.equal(0.25);
        expect(fill6.timeLossAtEnd).to.equal(2 * 3600 * 1000);
        expect(fill6.efficiencyLossAtEnd).to.equal(0.1667);
        expect(fill6.meanRunDuration).to.equal((3600 + 40 * 60) * 1000);
        expect(fill6.totalCtfFileSize).to.equal(67956862061);
        expect(fill6.totalTfFileSize).to.equal(741800696322);

        expect(fill1.fillNumber).to.equal(1);
        expect(fill1.runsCoverage).to.equal(0);
        expect(fill1.efficiency).to.equal(0);
        expect(fill1.timeLossAtStart).to.equal(0);
        expect(fill1.efficiencyLossAtStart).to.equal(0);
        expect(fill1.timeLossAtEnd).to.equal(0);
        expect(fill1.efficiencyLossAtEnd).to.equal(0);
        expect(fill1.meanRunDuration).to.equal(0);
        expect(fill1.totalCtfFileSize).to.equal(0);
        expect(fill1.totalTfFileSize).to.equal(0);
    });

    it('should successfully filter out fills after a date (excluded) for statistics', async () => {
        {
            const allStatistics = await statisticsService.getLhcFillStatistics({
                from: new Date('2019/08/08 10:00:00').getTime(),
                to: new Date('2019/08/08 11:00:01').getTime(),
            });
            expect(allStatistics).to.lengthOf(1);
        }
        {
            const allStatistics = await statisticsService.getLhcFillStatistics({
                from: new Date('2019/08/08 10:00:00').getTime(),
                to: new Date('2019/08/08 11:00:00').getTime(),
            });
            expect(allStatistics).to.lengthOf(0);
        }
    });

    it('should successfully filter out fills before a date (included) for statistics', async () => {
        {
            const allStatistics = await statisticsService.getLhcFillStatistics({
                from: new Date('2019/08/08 23:00:00').getTime(),
                to: new Date('2019/08/09 01:00:00').getTime(),
            });
            expect(allStatistics).to.lengthOf(1);
        }
        {
            const allStatistics = await statisticsService.getLhcFillStatistics({
                from: new Date('2019/08/08 23:00:01').getTime(),
                to: new Date('2019/08/09 01:00:00').getTime(),
            });
            expect(allStatistics).to.lengthOf(0);
        }
    });

    it('Should successfully extract weekly data sizes', async () => {
        const dataSizes = await statisticsService.getWeeklyDataSize({
            from: new Date('2019/08/08 10:00:00').getTime(),
            to: new Date('2023/08/09 01:00:00').getTime(),
        });
        expect(dataSizes).to.lengthOf(1);
        expect(dataSizes[0].size).to.equal('809757558383');
        expect(dataSizes[0].week).to.equal(31);
        expect(dataSizes[0].year).to.equal(2019);
    });

    it('should successfully filter out data size after a date (excluded) for weekly data size', async () => {
        // 20 - 21
        {
            const dataSizes = await statisticsService.getWeeklyDataSize({
                from: new Date('2019/08/08 19:00:00').getTime(),
                to: new Date('2019/08/08 20:00:01').getTime(),
            });
            expect(dataSizes).to.lengthOf(1);
        }
        {
            const dataSizes = await statisticsService.getWeeklyDataSize({
                from: new Date('2019/08/08 19:00:00').getTime(),
                to: new Date('2019/08/08 20:00:00').getTime(),
            });
            expect(dataSizes).to.lengthOf(0);
        }
    });

    it('should successfully filter out data size before a date (included) for weekly data size', async () => {
        {
            const dataSizes = await statisticsService.getWeeklyDataSize({
                from: new Date('2019/08/08 21:00:00').getTime(),
                to: new Date('2019/08/09 22:00:00').getTime(),
            });
            expect(dataSizes).to.lengthOf(1);
        }
        {
            const dataSizes = await statisticsService.getWeeklyDataSize({
                from: new Date('2019/08/08 21:00:01').getTime(),
                to: new Date('2019/08/09 22:00:00').getTime(),
            });
            expect(dataSizes).to.lengthOf(0);
        }
    });

    it('Should successfully extract distribution of time between runs', async () => {
        // 3 runs in the seeders: 1 during 1 hour and 2 during 2 hours
        const histogram = await statisticsService.getTimeBetweenRunsDistribution({
            from: new Date('2019/08/08 10:00:00').getTime(),
            to: new Date('2023/08/09 01:00:00').getTime(),
        });
        expect(histogram).to.be.an('object');
        const { bins, min, max } = histogram;
        expect(bins).to.eql([{ offset: 0, count: 1 }, { offset: 6, count: 1 }]);
        expect(min).to.equal(0);
        // Limit window is 30 minutes, which means max 7 (6 * 5minutes => 30)
        expect(max).to.equal(7);
    });

    it('should successfully filter out runs after a date (excluded) for time between runs distribution', async () => {
        {
            const { bins } = await statisticsService.getTimeBetweenRunsDistribution({
                from: new Date('2019/08/08 15:00:00').getTime(),
                to: new Date('2019/08/08 16:00:01').getTime(),
            });
            expect(bins).to.lengthOf(1);
        }
        {
            const { bins } = await statisticsService.getTimeBetweenRunsDistribution({
                from: new Date('2019/08/08 15:00:00').getTime(),
                to: new Date('2019/08/08 16:00:00').getTime(),
            });
            expect(bins).to.lengthOf(0);
        }
    });

    it('should successfully filter out runs before a date (included) for time between runs distribution', async () => {
        {
            const { bins } = await statisticsService.getTimeBetweenRunsDistribution({
                from: new Date('2019/08/08 21:00:00').getTime(),
                to: new Date('2019/08/09 01:00:00').getTime(),
            });
            expect(bins).to.lengthOf(1);
        }
        {
            const { bins } = await statisticsService.getTimeBetweenRunsDistribution({
                from: new Date('2019/08/08 21:00:01').getTime(),
                to: new Date('2019/08/09 01:00:00').getTime(),
            });
            expect(bins).to.lengthOf(0);
        }
    });

    it('Should successfully extract efficiency per detectors', async () => {
        const detectorsEfficienciesPerFill = await statisticsService.getDetectorsEfficienciesPerFill({
            from: new Date('2019/08/08 10:00:00').getTime(),
            to: new Date('2023/08/09 01:00:00').getTime(),
        });
        expect(detectorsEfficienciesPerFill).to.lengthOf(1);
        const [{ fillNumber, efficiencies, netEfficiencies }] = detectorsEfficienciesPerFill;
        expect(fillNumber).to.equal(6);
        expect(efficiencies).to.eql({ ITS: 0.25, FT0: 0.25 });
        expect(netEfficiencies).to.eql({ ITS: 0.0833, FT0: 0.25 });
    });

    it('should successfully filter out runs after a date (excluded) for detector efficiencies', async () => {
        {
            const detectorsEfficienciesPerFill = await statisticsService.getDetectorsEfficienciesPerFill({
                from: new Date('2019/08/08 10:00:00').getTime(),
                to: new Date('2019/08/08 11:00:01').getTime(),
            });
            expect(detectorsEfficienciesPerFill).to.lengthOf(1);
        }
        {
            const detectorsEfficienciesPerFill = await statisticsService.getDetectorsEfficienciesPerFill({
                from: new Date('2019/08/08 10:00:00').getTime(),
                to: new Date('2019/08/08 11:00:00').getTime(),
            });
            expect(detectorsEfficienciesPerFill).to.lengthOf(0);
        }
    });

    it('should successfully filter out runs before a date (included) for detector efficiencies', async () => {
        {
            const detectorsEfficienciesPerFill = await statisticsService.getDetectorsEfficienciesPerFill({
                from: new Date('2019/08/08 23:00:00').getTime(),
                to: new Date('2019/08/09 01:00:00').getTime(),
            });
            expect(detectorsEfficienciesPerFill).to.lengthOf(1);
        }
        {
            const detectorsEfficienciesPerFill = await statisticsService.getDetectorsEfficienciesPerFill({
                from: new Date('2019/08/08 23:00:01').getTime(),
                to: new Date('2019/08/09 01:00:00').getTime(),
            });
            expect(detectorsEfficienciesPerFill).to.lengthOf(0);
        }
    });

    it('should successfully extract tags occurrences for logs created in a given period', async () => {
        const tagsOccurrences = await statisticsService.getTagsOccurrencesInLogs({
            from: new Date('2019/01/01 00:00:00').getTime(),
            to: new Date('2020/12/31 23:59:59').getTime(),
        });
        expect(tagsOccurrences).eql([
            { tag: 'FOOD', count: 2 },
            { tag: 'RUN', count: 2 },
            { tag: 'DPG', count: 1 },
            { tag: 'GLOBAL', count: 1 },
            { tag: 'RC', count: 1 },
            { tag: 'TEST-TAG-36', count: 1 },
            { tag: 'TEST-TAG-37', count: 1 },
            { tag: 'TEST-TAG-38', count: 1 },
            { tag: 'TEST-TAG-39', count: 1 },
            { tag: 'TEST-TAG-40', count: 1 },
            { tag: 'TEST-TAG-41', count: 1 },
        ]);
    });

    it('should successfully filter out logs before a date (included) for tag occurrences', async () => {
        {
            const tagsOccurrences = await statisticsService.getTagsOccurrencesInLogs({
                from: new Date('2000/01/02 00:00:00').getTime(),
                to: new Date('2000/01/02 12:00:01').getTime(),
            });
            expect(tagsOccurrences).eql([{ tag: 'MAINTENANCE', count: 1 }]);
        }
        {
            const tagsOccurrences = await statisticsService.getTagsOccurrencesInLogs({
                from: new Date('2000/01/02 00:00:00').getTime(),
                to: new Date('2000/01/02 12:00:00').getTime(),
            });
            expect(tagsOccurrences).to.lengthOf(0);
        }
    });

    it('should successfully filter out logs after a date (excluded) for tags occurrences', async () => {
        {
            const tagsOccurrences = await statisticsService.getTagsOccurrencesInLogs({
                from: new Date('2000/01/02 12:00:00').getTime(),
                to: new Date('2000/01/02 13:00:00').getTime(),
            });
            expect(tagsOccurrences).eql([{ tag: 'MAINTENANCE', count: 1 }]);
        }
        {
            const tagsOccurrences = await statisticsService.getTagsOccurrencesInLogs({
                from: new Date('2000/01/02 12:01:00').getTime(),
                to: new Date('2000/01/02 13:00:00').getTime(),
            });
            expect(tagsOccurrences).to.lengthOf(0);
        }
    });

    it('should successfully extract EoR reason occurrences for runs in a given period', async () => {
        const eorReasonsOccurrences = await statisticsService.getEorReasonsOccurrences({
            from: new Date('2000/01/01 00:00:00').getTime(),
            to: new Date('2023/12/31 23:59:59').getTime(),
        });
        expect(eorReasonsOccurrences).to.lengthOf(3);
        eorReasonsOccurrences.sort(({ title: title1 }, { title: title2 }) => title1.localeCompare(title2));
        expect(eorReasonsOccurrences).to.eql([
            { category: 'DETECTORS', title: 'CPV', count: 1 },
            { category: 'OTHER', title: 'Some-other', count: 1 },
            { category: 'DETECTORS', title: 'TPC', count: 1 },
        ]);
    });

    it('should successfully filter out runs after a date (excluded) for EoR reasons occurrences', async () => {
        {
            const eorReasonsOccurrences = await statisticsService.getEorReasonsOccurrences({
                from: new Date('2019/08/08 12:00:00').getTime(),
                to: new Date('2019/08/08 14:00:01').getTime(),
            });
            expect(eorReasonsOccurrences).to.lengthOf(1);
            expect(eorReasonsOccurrences).to.eql([{ category: 'DETECTORS', title: 'TPC', count: 1 }]);
        }
        {
            const eorReasonsOccurrences = await statisticsService.getEorReasonsOccurrences({
                from: new Date('2019/08/08 12:00:00').getTime(),
                to: new Date('2019/08/08 14:00:00').getTime(),
            });
            expect(eorReasonsOccurrences).to.lengthOf(0);
        }
    });

    it('should successfully filter out runs before a date (included) for EoR reasons occurrences', async () => {
        {
            const eorReasonsOccurrences = await statisticsService.getEorReasonsOccurrences({
                from: new Date('2019/08/08 16:00:00').getTime(),
                to: new Date('2019/08/08 18:00:01').getTime(),
            });
            expect(eorReasonsOccurrences).to.lengthOf(1);
            expect(eorReasonsOccurrences).to.eql([{ category: 'DETECTORS', title: 'TPC', count: 1 }]);
        }
        {
            const eorReasonsOccurrences = await statisticsService.getEorReasonsOccurrences({
                from: new Date('2019/08/08 16:00:01').getTime(),
                to: new Date('2019/08/08 18:00:00').getTime(),
            });
            expect(eorReasonsOccurrences).to.lengthOf(0);
        }
    });
};
