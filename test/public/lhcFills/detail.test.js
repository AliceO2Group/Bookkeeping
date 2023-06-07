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

const { defaultBefore, defaultAfter, expectInnerText, pressElement, goToPage } = require('../defaults.js');
const { expect } = require('chai');

module.exports = () => {
    let page;
    let browser;

    before(async () => {
        [page, browser] = await defaultBefore();
    });

    it('should successfully display lhc fills details page', async () => {
        await goToPage(page, 'lhc-fill-details', { queryParameters: { fillNumber: 6 } });
        await expectInnerText(page, 'h2', 'Fill No. 6');
    });

    it('should successfully emphasize the fills that have a stable beams', async () => {
        // Fill #6 has a stable beam
        {
            const stableBeamBadge = await page.$('#stable-beam-badge');
            expect(stableBeamBadge).to.be.not.null;
            expect(await stableBeamBadge.evaluate((element) => element.classList.contains('bg-primary'))).to.be.true;
            expect(await stableBeamBadge.evaluate((element) => element.innerText)).to.equal('STABLE BEAM');
        }

        // Fill #5 has an ongoing stable beam
        await goToPage(page, 'lhc-fill-details', { queryParameters: { fillNumber: 5 } });
        {
            const stableBeamBadge = await page.$('#stable-beam-badge');
            expect(stableBeamBadge).to.be.not.null;
            expect(await stableBeamBadge.evaluate((element) => element.classList.contains('bg-success'))).to.be.true;
            expect(await stableBeamBadge.evaluate((element) => element.innerText)).to.equal('STABLE BEAM - ONGOING');
        }
    });

    it('should successfully display runs statistics', async () => {
        await goToPage(page, 'lhc-fill-details', { queryParameters: { fillNumber: 6 } });
        const statistics = await page.$('#statistics');
        expect(statistics).to.be.not.null;
        const statisticsContent = await page.$eval('#statistics', (element) => element.innerText);
        expect(statisticsContent).to.include('Over 2 minutes');
        expect(statisticsContent).to.include('Under 2 minutes');
        expect(statisticsContent).to.include('Per quality');
        expect(statisticsContent).to.include('Per detectors');
    });

    it('should display valid fill statistics', async () => {
        const efficiency = await page.$eval('#lhc-fill-efficiency', (element) => element.innerText);
        expect(efficiency.endsWith('41.67%')).to.be.true;
        const totalCtf = await page.$eval('#lhc-fill-totalCtfFileSize', (element) => element.innerText);
        expect(totalCtf.endsWith('67.9569 GB')).to.be.true;
        const totalTf = await page.$eval('#lhc-fill-totalTfFileSize', (element) => element.innerText);
        expect(totalTf.endsWith('741.801 GB')).to.be.true;
        const durationBeforeFirstRun = await page.$eval('#lhc-fill-durationBeforeFirstRun', (element) => element.innerText);
        expect(durationBeforeFirstRun.endsWith('03:00:00 (25.00%)')).to.be.true;
        const durationAfterLastRun = await page.$eval('#lhc-fill-durationAfterLastRun', (element) => element.innerText);
        expect(durationAfterLastRun.endsWith('02:00:00 (16.67%)')).to.be.true;
        const meanRunDuration = await page.$eval('#lhc-fill-meanRunDuration', (element) => element.innerText);
        expect(meanRunDuration.endsWith('01:40:00')).to.be.true;
        const runsCoverage = await page.$eval('#lhc-fill-runsCoverage', (element) => element.innerText);
        expect(runsCoverage.endsWith('05:00:00')).to.be.true;
        const timeBetweenRuns = await page.$eval(
            '#lhc-fill-timeElapsedBetweenRuns div',
            (element) => element.innerText,
        );
        expect(timeBetweenRuns.startsWith('02:00:00')).to.be.true;
        const timeBetweenRunsWarning = await page.$eval(
            '#lhc-fill-timeElapsedBetweenRuns .popover',
            (element) => element.innerText,
        );
        expect(timeBetweenRunsWarning).to.equal('Some runs have missing start or end');

        const itsStatisticsName = await page.$eval(
            '#detector-statistics-ITS .detector-statistics-name',
            (element) => element.innerText,
        );
        expect(itsStatisticsName.startsWith('ITS')).to.be.true;

        const itsStatisticsCount = await page.$eval(
            '#detector-statistics-ITS .detector-statistics-count',
            (element) => element.innerText,
        );
        expect(itsStatisticsCount).to.equal('3');

        const itsStatisticsEfficiency = await page.$eval(
            '#detector-statistics-ITS .detector-statistics-efficiency',
            (element) => element.innerText,
        );
        expect(itsStatisticsEfficiency).to.equal('(25.00%)');
    });

    it('should successfully switch between physics run and all runs and display valid fill statistics', async () => {
        await pressElement(page, '#all-runs-tab');
        await page.waitForTimeout(50);

        {
            const durationBeforeFirstRun = await page.$eval('#lhc-fill-durationBeforeFirstRun', (element) => element.innerText);
            expect(durationBeforeFirstRun.endsWith('02:00:00 (16.67%)')).to.be.true;
        }

        const meanRunDuration = await page.$eval('#lhc-fill-meanRunDuration', (element) => element.innerText);
        expect(meanRunDuration.endsWith('01:15:00')).to.be.true;

        const cpvStatisticsName = await page.$eval(
            '#detector-statistics-CPV .detector-statistics-name',
            (element) => element.innerText,
        );
        expect(cpvStatisticsName.startsWith('CPV')).to.be.true;

        const cpvStatisticsCount = await page.$eval(
            '#detector-statistics-CPV .detector-statistics-count',
            (element) => element.innerText,
        );
        expect(cpvStatisticsCount).to.equal('1');

        const cpvStatisticsEfficiency = await page.$eval(
            '#detector-statistics-CPV .detector-statistics-efficiency',
            (element) => element.innerText,
        );
        expect(cpvStatisticsEfficiency).to.equal('(0.00%)');

        // Test the switch back to physics only
        await pressElement(page, '#physics-runs-tab');
        await page.waitForTimeout(50);

        {
            const durationBeforeFirstRun = await page.$eval('#lhc-fill-durationBeforeFirstRun', (element) => element.innerText);
            expect(durationBeforeFirstRun.endsWith('03:00:00 (25.00%)')).to.be.true;
        }
    });

    it('should successfully display runs related to the fill, with their detectors sorted alphabetically', async () => {
        const runsTable = await page.$$('#runs tbody tr');

        expect(runsTable.length).to.equal(4);

        expect(await page.$eval('#runs tbody tr:nth-child(1) td:nth-child(2)', (element) => element.innerText)).to.equal('2FT0,ITS');
    });

    it('should successfully display time elapsed between runs', async () => {
        // eslint-disable-next-line require-jsdoc
        const getRunDuration = async (rowNumber) => page.$eval(
            `#runs tbody tr:nth-of-type(${rowNumber})`,
            (row) => document.querySelector(`#${row.id}-timeSincePreviousRun`).innerText,
        );
        expect(await getRunDuration(1)).to.equal('-');
        expect(await getRunDuration(2)).to.equal('UNKNOWN');
        expect(await getRunDuration(3)).to.equal('00:00:00');
        expect(await getRunDuration(4)).to.equal('02:00:00');
    });

    it('should successfully navigate to run detail page', async () => {
        const row = await page.$('#runs tbody tr');
        expect(row).to.be.not.null;
        // Remove "row" prefix to get fill number
        const runId = await row.evaluate((element) => element.id.slice(3));

        await row.$eval('td:first-of-type a', (link) => link.click());
        await page.waitForNetworkIdle();
        await page.waitForTimeout(100);
        const redirectedUrl = await page.url();
        const urlParameters = redirectedUrl.slice(redirectedUrl.indexOf('?') + 1).split('&');

        expect(urlParameters).to.contain('page=run-detail');
        expect(urlParameters).to.contain(`id=${runId}`);
    });

    after(async () => {
        await defaultAfter(page, browser);
    });
};
