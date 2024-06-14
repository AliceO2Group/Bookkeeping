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
const {
    defaultBefore,
    defaultAfter,
    expectInnerText,
    pressElement,
    expectUrlParams,
    reloadPage,
    goToPage,
    fillInput,
    getPopoverContent,
    waitForNavigation,
    waitForTableLength,
    getTableContent,
    getPopoverSelector,
} = require('../defaults.js');
const { RunCalibrationStatus } = require('../../../lib/domain/enums/RunCalibrationStatus.js');
const { getRun } = require('../../../lib/server/services/run/getRun.js');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');

const { expect } = chai;

const checkIconPath =
    'M6.406 1l-.719.688-2.781 2.781-.781-.781-.719-.688-1.406 1.406.688.719 1.5 1.5.719.688.719-.688 3.5-3.5.688-.719-1.406-1.406z';
const xIconPath =
    'M1.406 0l-1.406 1.406.688.719 1.781 1.781-1.781 1.781-.688.719 1.406 1.406.719-.688 1.781-1.781 1.781 1.781.719.688'
    + ' 1.406-1.406-.688-.719-1.781-1.781 1.781-1.781.688-.719-1.406-1.406-.719.688-1.781 1.781-1.781-1.781-.719-.688z';
const banIconPath =
    'M4 0c-2.203 0-4 1.797-4 4 0 2.203 1.797 4 4 4 2.203 0 4-1.797 4-4 0-2.203-1.797-4-4-4zm0 1c.655 0 1.258.209 1.75.563l-4.188'
    + ' 4.188c-.353-.492-.563-1.095-.563-1.75 0-1.663 1.337-3 3-3zm2.438 1.25c.353.492.563 1.095.563 1.75 0 1.663-1.337 3-3 3-.655'
    + ' 0-1.258-.209-1.75-.563l4.188-4.188z';

module.exports = () => {
    let page;
    let browser;
    let url;

    before(async () => {
        [page, browser, url] = await defaultBefore(page, browser);
        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
        });
        await resetDatabaseContent();
    });
    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('run detail loads correctly', async () => {
        await goToPage(page, 'run-detail', { queryParameters: { runNumber: 1 } });
        await expectInnerText(page, 'h2', 'Run #1');
    });

    it('successfully entered EDIT mode of a run', async () => {
        await pressElement(page, '#edit-run');
        await expectInnerText(page, '#save-run', 'Save');
        await expectInnerText(page, '#cancel-run', 'Revert');
    });

    it('successfully exited EDIT mode of a run', async () => {
        await pressElement(page, '#cancel-run');
        await expectInnerText(page, '#edit-run', 'Edit Run');
    });

    it('successfully changed run tags in EDIT mode', async () => {
        await reloadPage(page);
        await pressElement(page, '#edit-run');
        await pressElement(page, '#tags-selection #tagCheckbox1');
        await pressElement(page, '#save-run');
        await pressElement(page, '#edit-run');
        await page.waitForSelector('#tags-selection #tagCheckbox1');
        expect(await page.$eval('#tags-selection #tagCheckbox1', (elem) => elem.checked)).to.be.true;
    });

    it('should display detectors names', async () => {
        await reloadPage(page);
        const detectorNameSelector = '#Run-detectors .detector-name';
        const detectorNames = await page.$$eval(detectorNameSelector, (detectors) => detectors.map((detector) => detector.innerText));
        const expectedDetectorNames =
            ['ACO', 'CPV', 'CTP', 'EMC', 'FDD', 'FIT', 'FT0', 'FV0', 'HMP', 'ITS']
                .concat(['MCH', 'MFT', 'MID', 'PHS', 'TOF', 'TPC', 'TRD', 'TST', 'ZDC']);
        expect(detectorNames).to.deep.equal(expectedDetectorNames);

        const presentDetectorNameSelector = '#Run-detectors :is(.success, .danger) .detector-name';
        const presentDetectorName = await page.$eval(presentDetectorNameSelector, (detector) => detector.innerText);
        expect(presentDetectorName).to.equal('CPV');
    });

    it('should display detectors qualities and colors', async () => {
        const detectorBadgeClassesSelector = '#Run-detectors .detector-badge';
        const detectorBadgeClasses = await page.$$eval(detectorBadgeClassesSelector, (badges) => badges.map((badge) => badge.className));

        const detectorBadgesPresent = detectorBadgeClasses.filter((elem) => !elem.includes('gray'));
        const detectorBadgesNotPresent = detectorBadgeClasses.filter((elem) => elem.includes('gray'));

        expect(detectorBadgesPresent.length).to.equal(1);
        expect(detectorBadgesNotPresent.length).to.equal(18);

        detectorBadgesPresent.every((badge) => {
            expect(badge).to.contain.oneOf(['success', 'danger']);
            expect(badge).to.contain.oneOf(['b-success', 'b-danger']);
        });

        detectorBadgesNotPresent.every((badge) => {
            expect(badge).to.contain('b-gray');
            expect(badge).to.contain('gray');
        });
    });

    it('should successfully display detectors icons', async () => {
        const svgPaths = await page.$$eval('#Run-detectors .detector-quality-icon svg path', (elements) =>
            elements.map((elem) => elem.getAttribute('d')));

        svgPaths.every((path, index) => {
            if (index == 1) {
                expect(path).to.equal(checkIconPath);
            } else {
                expect(path).to.equal(banIconPath);
            }
        });
    });

    it('successfully update detectors qualities in EDIT mode', async () => {
        await pressElement(page, '#edit-run');
        await pressElement(page, '#Run-detectors .dropdown-trigger');

        const popoverSelector = await getPopoverSelector(await page.$('#Run-detectors .popover-trigger'));
        await page.waitForSelector(`${popoverSelector} .dropdown`);

        const goodQualityRadioSelector = '#detector-quality-1-good';
        const badQualityRadioSelector = '#detector-quality-1-bad';
        expect(await page.$eval(goodQualityRadioSelector, (element) => element.checked)).to.be.true;
        expect(await page.$eval(badQualityRadioSelector, (element) => element.checked)).to.be.false;
        await pressElement(page, badQualityRadioSelector);
        await fillInput(page, '#Run-detectors textarea', 'Justification');
        await pressElement(page, '#save-run');

        const detectorBadgeSelector = '#Run-detectors .detector-badge:nth-child(2)';
        await page.waitForSelector(detectorBadgeSelector);
        const detectorBadgeClass = await page.$eval(detectorBadgeSelector, (element) => element.className);
        expect(detectorBadgeClass).to.contain('b-danger');
        expect(detectorBadgeClass).to.contain('danger');
        expect(await page.$eval(detectorBadgeSelector, (element) => element.innerText)).to.equal('CPV');
        expect(await page.$eval('#Run-detectors .detector-badge:nth-child(2) .detector-quality-icon svg path', (element) =>
            element.getAttribute('d'))).to.equal(xIconPath);

        await pressElement(page, '#edit-run');
        await pressElement(page, '#Run-detectors .dropdown-trigger');
        await page.waitForSelector('.dropdown');

        expect(await page.$eval(goodQualityRadioSelector, (element) => element.checked)).to.be.false;
        expect(await page.$eval(badQualityRadioSelector, (element) => element.checked)).to.be.true;
        await pressElement(page, '#save-run');
    });

    it('should successfully update end of run reasons', async () => {
        await pressElement(page, '#edit-run');

        await page.waitForSelector('#Run-eorReasons select');
        await page.select('#Run-eorReasons select', 'DETECTORS');

        await page.waitForSelector('#Run-eorReasons select:nth-child(2)');
        await page.select('#Run-eorReasons select:nth-child(2)', 'CPV');
        await page.type('#Run-eorReasons input', 'A new EOR reason');
        await pressElement(page, '#add-eor-reason', true);
        // Flaky test, these options seem to fix it for now
        await page.waitForFunction(() => document.querySelectorAll('#Run-eorReasons .remove-eor-reason').length === 3, { polling: 'mutation' });

        // Remove the first EOR reason
        await pressElement(page, '.remove-eor-reason');
        await page.waitForFunction(() => document.querySelectorAll('#Run-eorReasons .remove-eor-reason').length === 2, { polling: 'mutation' });
        await pressElement(page, '#save-run');
        await page.waitForSelector('#edit-run');

        await waitForTableLength(page, 5);
        const eorReasons = await page.$$('#Run-eorReasons .eor-reason');

        expect(eorReasons).to.lengthOf(2);
        expect(await eorReasons[0].evaluate((element) => element.innerText))
            .to.equal('DETECTORS - TPC - Some Reason other than selected plus one');

        expect(await eorReasons[1].evaluate((element) => element.innerText))
            .to.equal('DETECTORS - CPV - A new EOR reason');
    });

    it('should successfully revert the update end of run reasons', async () => {
        await pressElement(page, '#edit-run');

        await page.waitForSelector('#Run-eorReasons select');
        await page.select('#Run-eorReasons select', 'OTHER');

        await page.waitForSelector('#Run-eorReasons select:nth-child(2)');
        await page.select('#Run-eorReasons select:nth-child(2)', 'Some-other');
        await page.type('#Run-eorReasons input', 'A new new EOR reason');
        await pressElement(page, '#add-eor-reason');

        // Remove the first EOR reason
        await pressElement(page, '.remove-eor-reason');
        await pressElement(page, '#cancel-run');
        await page.waitForSelector('#save-run', { hidden: true });

        await waitForTableLength(page, 5);
        const eorReasons = await page.$$('#Run-eorReasons .eor-reason');

        expect(eorReasons).to.lengthOf(2);
        expect(await eorReasons[0].evaluate((element) => element.innerText))
            .to.equal('DETECTORS - TPC - Some Reason other than selected plus one');

        expect(await eorReasons[1].evaluate((element) => element.innerText))
            .to.equal('DETECTORS - CPV - A new EOR reason');
    });

    it('should successfully update inelasticInteractionRate values of PbPb run', async () => {
        await goToPage(page, 'run-detail', { queryParameters: { runNumber: 54 } });
        await pressElement(page, '#edit-run');
        await fillInput(page, '#Run-inelasticInteractionRateAvg input', 100.1);
        await fillInput(page, '#Run-inelasticInteractionRateAtStart input', 101.1);
        await fillInput(page, '#Run-inelasticInteractionRateAtMid input', 102.1);
        await fillInput(page, '#Run-inelasticInteractionRateAtEnd input', 103.1);

        await pressElement(page, '#save-run');
        // Wait for edition mode to be gone
        await page.waitForSelector('#edit-run');

        await expectInnerText(page, '#Run-inelasticInteractionRateAvg', 'INELavg:\n100.1\nHz');
        await expectInnerText(page, '#Run-inelasticInteractionRateAtStart', 'INELstart:\n101.1\nHz');
        await expectInnerText(page, '#Run-inelasticInteractionRateAtMid', 'INELmid:\n102.1\nHz');
        await expectInnerText(page, '#Run-inelasticInteractionRateAtEnd', 'INELend:\n103.1\nHz');
    });

    it('should successfully update inelasticInteractionRateAvg of pp run', async () => {
        await goToPage(page, 'run-detail', { queryParameters: { runNumber: 49 } });
        await pressElement(page, '#edit-run');
        await fillInput(page, '#Run-inelasticInteractionRateAvg input', 100000);

        await pressElement(page, '#save-run');
        // Wait for edition mode to be gone
        await page.waitForSelector('#edit-run');

        await expectInnerText(page, '#Run-inelasticInteractionRateAvg', 'INELavg:\n100,000\nHz');
        await expectInnerText(page, '#Run-muInelasticInteractionRate', '\u03BC(INEL):\n0.009');
    });

    it('should show lhc data in edit mode', async () => {
        await goToPage(page, 'run-detail', { queryParameters: { runNumber: 1 } });
        await pressElement(page, '#edit-run');
        await expectInnerText(page, '#lhc-fill-fillNumber>strong', 'Fill number:');
    });

    it('can navigate to the flp panel', async () => {
        await waitForNavigation(page, () => pressElement(page, '#flps-tab'));
        await expectUrlParams(page, {
            page: 'run-detail',
            runNumber: 1,
            panel: 'flps',
        });
    });

    it('can navigate to the logs panel', async () => {
        await pressElement(page, '#logs-tab');
        await page.waitForSelector('#logs-tab.active');

        expectUrlParams(page, { page: 'run-detail', runNumber: 1, panel: 'logs' });
    });

    it('can navigate to a log detail page', async () => {
        await waitForTableLength(page, 5);

        // We expect the entry page to have the same id as the id from the run overview
        await waitForNavigation(page, () => pressElement(page, '#row1 .btn-redirect'));

        expectUrlParams(page, { page: 'log-detail', id: 1 });
    });

    it('should successfully navigate to the trigger counters panel', async () => {
        await goToPage(page, 'run-detail', { queryParameters: { runNumber: 1 } });

        await pressElement(page, '#trigger-counters-tab');
        await waitForTableLength(page, 2);
        expectUrlParams(page, { page: 'run-detail', runNumber: 1, panel: 'trigger-counters' });
        expect(await getTableContent(page)).to.deep.eql([
            ['FIRST-CLASS-NAME', '101', '102', '103', '104', '105', '106'],
            ['SECOND-CLASS-NAME', '2001', '2002', '2003', '2004', '2005', '2006'],
        ]);
    });

    it('should show lhc data in normal mode', async () => {
        const element = await page.$('#lhc-fill-fillNumber>strong');
        const value = await element.evaluate((el) => el.textContent);
        expect(value).to.equal('Fill number:');
    });

    it('successfully prevent from editing run quality of not ended runs', async () => {
        await goToPage(page, 'run-detail', { queryParameters: { runNumber: 105 } });

        await pressElement(page, '#edit-run');
        await page.waitForSelector('#cancel-run');
        expect(await page.$('#runQualitySelect')).to.be.null;
    });

    it('successfully prevent from editing detector\'s quality of not ended runs', async () => {
        await reloadPage(page);

        await pressElement(page, '#edit-run');
        await page.waitForSelector('#cancel-run');
        expect(await page.$('#Run-detectors .dropdown-trigger')).to.be.null;
    });

    it('should successfully navigate to the LHC fill details page', async () => {
        await goToPage(page, 'run-detail', { queryParameters: { runNumber: 108 } });

        await waitForNavigation(page, () => pressElement(page, '#lhc-fill-fillNumber a'));

        expectUrlParams(page, { page: 'lhc-fill-details', fillNumber: 1 });
    });

    it('notifies if a specified run number is invalid', async () => {
        // Navigate to a run detail view with a run number that cannot exist
        await goToPage(page, 'run-detail', { queryParameters: { runNumber: 'abc' } });

        // We expect there to be an error message
        await expectInnerText(page, '.alert', 'Invalid Attribute: "params.runNumber" must be a number');
    });

    it('notifies if a specified run number is not found', async () => {
        // Navigate to a run detail view with a run number that cannot exist
        await goToPage(page, 'run-detail', { queryParameters: { runNumber: 999 } });

        // We expect there to be an error message
        await expectInnerText(page, '.alert', 'Run with this run number (999) could not be found');
    });

    it('can return to the overview page if an error occurred', async () => {
        // We expect there to be a button to return to the overview page
        await expectInnerText(page, '.btn-primary.btn-redirect', 'Return to Overview');

        // We expect the button to return the user to the overview page when pressed
        await waitForNavigation(page, () => pressElement(page, '.btn-primary.btn-redirect'));
        expect(page.url()).to.equal(`${url}/?page=run-overview`);
    });

    it('should successfully display duration without warning popover when run has both trigger start and stop', async () => {
        await goToPage(page, 'run-detail', { queryParameters: { runNumber: 106 } });
        const runDurationCell = await page.waitForSelector('#runDurationValue');
        expect(await runDurationCell.$('.popover-trigger')).to.be.null;
        expect(await runDurationCell.evaluate((element) => element.innerText)).to.equal('25:00:00');
    });

    it('should successfully display duration without warning popover when run has trigger OFF', async () => {
        await goToPage(page, 'run-detail', { queryParameters: { runNumber: 107 } });
        const runDurationCell = await page.waitForSelector('#runDurationValue');
        expect(await runDurationCell.$('.popover-trigger')).to.be.null;
        expect(await runDurationCell.evaluate((element) => element.innerText)).to.equal('25:00:00');
    });

    it('should successfully display UNKNOWN without warning popover when run last for more than 48 hours', async () => {
        await goToPage(page, 'run-detail', { queryParameters: { runNumber: 105 } });
        const runDurationCell = await page.waitForSelector('#runDurationValue');
        expect(await runDurationCell.$('.popover-trigger')).to.be.null;
        expect(await runDurationCell.evaluate((element) => element.innerText)).to.equal('UNKNOWN');
    });

    it('should successfully display popover warning when run is missing trigger start', async () => {
        await goToPage(page, 'run-detail', { queryParameters: { runNumber: 104 } });
        const popoverContent = await getPopoverContent(await page.waitForSelector('#runDurationValue .popover-trigger'));
        expect(popoverContent).to.equal('Duration based on o2 start because of missing trigger start information');
    });

    it('should successfully display popover warning when run is missing trigger stop', async () => {
        await goToPage(page, 'run-detail', { queryParameters: { runNumber: 103 } });
        const popoverContent = await getPopoverContent(await page.waitForSelector('#runDurationValue .popover-trigger'));
        expect(popoverContent).to.equal('Duration based on o2 stop because of missing trigger stop information');
    });

    it('should successfully display popover warning when run is missing trigger start and stop', async () => {
        await goToPage(page, 'run-detail', { queryParameters: { runNumber: 102 } });
        const popoverContent = await getPopoverContent(await page.waitForSelector('#runDurationValue .popover-trigger'));
        expect(popoverContent).to.equal('Duration based on o2 start AND stop because of missing trigger information');
    });

    it('should display OFF in the nEPNs field when EPNs is null', async () => {
        await goToPage(page, 'run-detail', { queryParameters: { runNumber: 3 } });
        await page.waitForSelector('#Run-nEpns');
        await expectInnerText(page, '#Run-nEpns', 'Number of EPNs:\nOFF');
    });

    it('should not display OFF in the nEPNs field when EPNs is not null', async () => {
        await goToPage(page, 'run-detail', { queryParameters: { runNumber: 106 } });
        await page.waitForSelector('#Run-nEpns');
        await expectInnerText(page, '#Run-nEpns', 'Number of EPNs:\n12');
    });

    it('should not display calibration status on non-calibration runs', async () => {
        await page.waitForSelector('#Run-definition');
        expect(await page.$('#Run-definition + #Run-runType')).to.not.be.null;
    });

    it('should display calibration status on calibration runs', async () => {
        await goToPage(page, 'run-detail', { queryParameters: { runNumber: 40 } });
        await page.waitForSelector('#Run-calibrationStatus');
        await expectInnerText(page, '#Run-calibrationStatus', `Calibration status:\n${RunCalibrationStatus.NO_STATUS}`);
    });

    it('should allow to update calibration status on calibration runs', async () => {
        const runNumber = 40;
        expect((await getRun({ runNumber })).calibrationStatus).to.equal(RunCalibrationStatus.NO_STATUS);

        await goToPage(page, 'run-detail', { queryParameters: { runNumber: runNumber } });
        await pressElement(page, '#edit-run');
        await page.waitForSelector('#Run-calibrationStatus select');
        await page.select('#Run-calibrationStatus select', RunCalibrationStatus.SUCCESS);
        await pressElement(page, '#save-run');

        // Wait for page to be reloaded
        await page.waitForSelector('#edit-run');

        expect((await getRun({ runNumber })).calibrationStatus).to.equal(RunCalibrationStatus.SUCCESS);
    });

    it('should successfully expose a button to create a new log related to the displayed environment', async () => {
        await waitForNavigation(page, () => pressElement(page, '#run-overview'));
        await waitForNavigation(page, () => pressElement(page, '#row106-runNumber-text > div > a'));

        await waitForNavigation(page, () => pressElement(page, '#create-log'));
        expectUrlParams(page, { page: 'log-create', runNumbers: '106', lhcFillNumbers: '1' });

        await page.waitForSelector('input#environments');
        expect(await page.$eval('input#run-numbers', (element) => element.value)).to.equal('106');
    });

    it('should not display the LHC Data when beam is not stable', async () => {
        await waitForNavigation(page, () => pressElement(page, '#run-overview'));
        await waitForNavigation(page, () => pressElement(page, '#row107-runNumber-text > div > a'));

        await expectInnerText(page, '#NoLHCDataNotStable', 'No LHC Fill information, beam mode was: UNSTABLE BEAMS');
    });

    it('should display the LHC fill number when beam is stable', async () => {
        await waitForNavigation(page, () => pressElement(page, '#run-overview'));
        await waitForNavigation(page, () => pressElement(page, '#row108-runNumber-text > div > a'));

        await expectInnerText(page, '#lhc-fill-fillNumber', 'Fill number:\n1');
    });

    it('should successfully display links to infologger and QCG', async () => {
        await page.waitForSelector('.external-links');
        expect(await page.$eval('.external-links a', ({ href }) => href))
            .to.equal('http://localhost:8081/?q={%22run%22:{%22match%22:%22108%22},%22severity%22:{%22in%22:%22W%20E%20F%22}}');
        expect(await page.$eval('.external-links a:nth-of-type(2)', ({ href }) => href))
            .to.equal('http://localhost:8082/?page=layoutShow&runNumber=108&definition=COMMISSIONING&pdpBeamType=cosmic&runType=PHYSICS');
    });
};
