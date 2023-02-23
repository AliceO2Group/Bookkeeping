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

const chai = require('chai');
const { defaultBefore, defaultAfter, expectInnerText, pressElement, getFirstRow } = require('../defaults');
const { reloadPage, goToPage } = require('../defaults.js');

const { expect } = chai;

const checkIconPath =
    'M6.406 1l-.719.688-2.781 2.781-.781-.781-.719-.688-1.406 1.406.688.719 1.5 1.5.719.688.719-.688 3.5-3.5.688-.719-1.406-1.406z';
const xIconPath =
    'M1.406 0l-1.406 1.406.688.719 1.781 1.781-1.781 1.781-.688.719 1.406 1.406.719-.688 1.781-1.781 1.781 1.781.719.688'
    + ' 1.406-1.406-.688-.719-1.781-1.781 1.781-1.781.688-.719-1.406-1.406-.719.688-1.781 1.781-1.781-1.781-.719-.688z';

module.exports = () => {
    let page;
    let browser;
    let url;

    let table;
    let firstRowId;

    before(async () => {
        [page, browser, url] = await defaultBefore(page, browser);
        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
        });
    });
    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('run detail loads correctly', async () => {
        await goToPage(page, 'run-detail', { queryParameters: { id: 1 } });
        await expectInnerText(page, 'h2', 'Run #1');
    });

    it('successfully entered EDIT mode of a run', async () => {
        await pressElement(page, '#edit-run');
        await page.waitForTimeout(100);
        await expectInnerText(page, '#save-run', 'Save');
        await expectInnerText(page, '#cancel-run', 'Revert');
    });

    it('successfully exited EDIT mode of a run', async () => {
        await pressElement(page, '#cancel-run');
        await page.waitForTimeout(100);
        await expectInnerText(page, '#edit-run', 'Edit Run');
    });

    it('successfully changed run tags in EDIT mode', async () => {
        await reloadPage(page);
        await pressElement(page, '#edit-run');
        await page.waitForTimeout(100);
        await pressElement(page, '#tags-selection #tagCheckbox1');
        await page.waitForTimeout(100);
        await pressElement(page, '#save-run');
        await page.waitForTimeout(100);
        await pressElement(page, '#edit-run');
        await page.waitForTimeout(100);
        expect(await page.$eval('#tags-selection #tagCheckbox1', (elem) => elem.checked)).to.be.true;
    });

    it('successfully display detectors qualities with colors and icon', async () => {
        await reloadPage(page);
        const detectorBadgeSelector = '#Run-detectors .detector-badge';
        const detectorBadgeClass = await page.$eval(detectorBadgeSelector, (element) => element.className);
        expect(detectorBadgeClass).to.contain('b-success');
        expect(detectorBadgeClass).to.contain('success');
        expect(await page.$eval(detectorBadgeSelector, (element) => element.innerText)).to.equal('CPV');
        expect(await page.$eval('#Run-detectors .detector-quality-icon svg path', (element) => element.getAttribute('d')))
            .to.equal(checkIconPath);
    });

    it('successfully update detectors qualities in EDIT mode', async () => {
        await reloadPage(page);
        await pressElement(page, '#edit-run');
        await page.waitForTimeout(100);
        await pressElement(page, '#Run-detectors .toggle-container');
        await page.waitForTimeout(100);
        const goodQualityRadioSelector = '#detector-quality-1-good';
        const badQualityRadioSelector = '#detector-quality-1-bad';
        expect(await page.$eval(goodQualityRadioSelector, (element) => element.checked)).to.be.true;
        expect(await page.$eval(badQualityRadioSelector, (element) => element.checked)).to.be.false;
        await pressElement(page, badQualityRadioSelector);
        await pressElement(page, '#save-run');
        await page.waitForTimeout(100);

        const detectorBadgeSelector = '#Run-detectors .detector-badge';
        const detectorBadgeClass = await page.$eval(detectorBadgeSelector, (element) => element.className);
        expect(detectorBadgeClass).to.contain('b-danger');
        expect(detectorBadgeClass).to.contain('danger');
        expect(await page.$eval(detectorBadgeSelector, (element) => element.innerText)).to.equal('CPV');
        expect(await page.$eval('#Run-detectors .detector-quality-icon svg path', (element) => element.getAttribute('d')))
            .to.equal(xIconPath);

        await pressElement(page, '#edit-run');
        await page.waitForTimeout(100);
        await pressElement(page, '#Run-detectors .toggle-container');
        await page.waitForTimeout(100);
        expect(await page.$eval(goodQualityRadioSelector, (element) => element.checked)).to.be.false;
        expect(await page.$eval(badQualityRadioSelector, (element) => element.checked)).to.be.true;
    });

    it('should show lhc data in edit mode', async () => {
        await reloadPage(page);
        await pressElement(page, '#edit-run');
        await page.waitForTimeout(100);
        const element = await page.$('#lhc-fill-fillNumber>strong');
        const value = await element.evaluate((el) => el.textContent);
        expect(value).to.equal('Fill number:');
    });

    it('can navigate to the flp panel', async () => {
        await pressElement(page, '#flps-tab');
        await page.waitForTimeout(100);
        const redirectedUrl = await page.url();
        const urlParameters = redirectedUrl.slice(redirectedUrl.indexOf('?') + 1).split('&');
        expect(urlParameters).to.contain('page=run-detail');
        expect(urlParameters).to.contain('id=1');
        expect(urlParameters).to.contain('panel=flps');
    });

    it('can navigate to the logs panel', async () => {
        await pressElement(page, '#logs-tab');
        await page.waitForTimeout(100);
        const redirectedUrl = await page.url();
        const urlParameters = redirectedUrl.slice(redirectedUrl.indexOf('?') + 1).split('&');
        expect(urlParameters).to.contain('page=run-detail');
        expect(urlParameters).to.contain('id=1');
        expect(urlParameters).to.contain('panel=logs');
    });
    it('should show lhc data in normal mode', async () => {
        await page.waitForTimeout(100);
        const element = await page.$('#lhc-fill-fillNumber>strong');
        const value = await element.evaluate((el) => el.textContent);
        expect(value).to.equal('Fill number:');
    });
    it('can navigate to a log detail page', async () => {
        table = await page.$$('tr');
        firstRowId = await getFirstRow(table, page);

        // We expect the entry page to have the same id as the id from the run overview
        await pressElement(page, `#${firstRowId}`);
        await page.waitForTimeout(300);
        const redirectedUrl = await page.url();
        const urlParameters = redirectedUrl.slice(redirectedUrl.indexOf('?') + 1).split('&');
        expect(urlParameters).to.contain('page=log-detail');
        expect(urlParameters).to.contain('id=1');
    });

    it('successfully prevent from editing run quality of not ended runs', async () => {
        await goToPage(page, 'run-detail', { queryParameters: { id: 105 } });

        await pressElement(page, '#edit-run');
        await page.waitForTimeout(100);
        expect(await page.$('#runQualitySelect')).to.be.null;
    });

    it('successfully prevent from editing detector\'s quality of not ended runs', async () => {
        await reloadPage(page);

        await pressElement(page, '#edit-run');
        await page.waitForTimeout(100);
        expect(await page.$('#Run-detectors .toggle-container')).to.be.null;
    });

    it('should successfully navigate to the LHC fill details page', async () => {
        await goToPage(page, 'run-detail', { queryParameters: { id: 106 } });
        await page.waitForTimeout(100);

        const fillNumberSelector = '#lhc-fill-fillNumber a';
        // Remove "row" prefix to get fill number
        const fillNumber = await page.$eval(fillNumberSelector, (element) => element.innerText);

        await page.$eval(fillNumberSelector, (link) => link.click());
        await page.waitForNetworkIdle();
        await page.waitForTimeout(100);

        const redirectedUrl = await page.url();
        const urlParameters = redirectedUrl.slice(redirectedUrl.indexOf('?') + 1).split('&');

        expect(urlParameters).to.contain('page=lhc-fill-details');
        expect(urlParameters).to.contain(`fillNumber=${fillNumber}`);
    });

    it('notifies if a specified run id is invalid', async () => {
        // Navigate to a run detail view with an id that cannot exist
        await goToPage(page, 'run-detail', { queryParameters: { id: 'abc' } });

        // We expect there to be an error message
        await expectInnerText(page, '.alert', 'Invalid Attribute: "params.runId" must be a number');
    });

    it('notifies if a specified run id is not found', async () => {
        // Navigate to a run detail view with an id that cannot exist
        await goToPage(page, 'run-detail', { queryParameters: { id: 999 } });

        // We expect there to be an error message
        await expectInnerText(page, '.alert', 'Run with this id (999) could not be found');
    });

    it('can return to the overview page if an error occurred', async () => {
        // We expect there to be a button to return to the overview page
        await expectInnerText(page, '.btn-primary.btn-redirect', 'Return to Overview');

        // We expect the button to return the user to the overview page when pressed
        await pressElement(page, '.btn-primary.btn-redirect');
        await page.waitForTimeout(100);
        expect(page.url()).to.equal(`${url}/?page=run-overview`);
    });

    it('should successfully display duration without warning popover when run has both trigger start and stop', async () => {
        await goToPage(page, 'run-detail', { queryParameters: { id: 106 } });
        const runDurationCell = await page.$('#runDurationValue');
        expect(await runDurationCell.$('.popover-container')).to.be.null;
        expect(await runDurationCell.evaluate((element) => element.innerText)).to.equal('25:00:00');
    });

    it('should successfully display UNKNOWN without warning popover when run last for more than 48 hours', async () => {
        await goToPage(page, 'run-detail', { queryParameters: { id: 105 } });
        const runDurationCell = await page.$('#runDurationValue');
        expect(await runDurationCell.$('.popover-container')).to.be.null;
        expect(await runDurationCell.evaluate((element) => element.innerText)).to.equal('UNKNOWN');
    });

    it('should successfully display popover warning when run is missing trigger start', async () => {
        await goToPage(page, 'run-detail', { queryParameters: { id: 104 } });
        const runDurationCell = await page.$('#runDurationValue');
        expect(await runDurationCell.$eval('.popover-container .popover', (element) => element.innerHTML))
            .to.equal('Duration based on o2 start because of missing trigger start information');
    });

    it('should successfully display popover warning when run is missing trigger stop', async () => {
        await goToPage(page, 'run-detail', { queryParameters: { id: 103 } });
        const runDurationCell = await page.$('#runDurationValue');
        expect(await runDurationCell.$eval('.popover-container .popover', (element) => element.innerHTML))
            .to.equal('Duration based on o2 stop because of missing trigger end information');
    });

    it('should successfully display popover warning when run is missing trigger start and stop', async () => {
        await goToPage(page, 'run-detail', { queryParameters: { id: 102 } });
        const runDurationCell = await page.$('#runDurationValue');
        expect(await runDurationCell.$eval('.popover-container .popover', (element) => element.innerHTML))
            .to.equal('Duration based on o2 start AND stop because of missing trigger information');
    });
};
