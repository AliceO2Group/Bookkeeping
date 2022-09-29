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

const { defaultBefore, defaultAfter, expectInnerText } = require('../defaults.js');
const { expect } = require('chai');

module.exports = () => {
    let page;
    let browser;
    let url;

    before(async () => {
        [page, browser, url] = await defaultBefore();
    });

    it('should successfully display lhc fills details page', async () => {
        await page.goto(`${url}/?page=lhc-fill-details&fillNumber=6`, { waitUntil: 'networkidle0' });
        await expectInnerText(page, 'h2', 'Fill No. 6');
    });

    it('should successfully emphasize the fills that have a stable beams', async () => {
        // Fill #1 has a stable beam
        const stableBeamBadge = await page.$('#stable-beam-badge');
        expect(stableBeamBadge).to.be.not.null;
    });

    it('should successfully display runs statistics', async () => {
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
        const durationBeforeFirstRun = await page.$eval(
            '#lhc-fill-durationBeforeFirstRun',
            (element) => element.innerText,
        );
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

    it('should successfully display runs related to the fill', async () => {
        const runsTable = await page.$$('#runs tbody tr');

        expect(runsTable.length).to.equal(4);
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
