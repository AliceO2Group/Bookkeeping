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
    expectLink,
    waitForTableLength,
    getTableContent,
    getPopoverSelector,
    expectRowValues,
} = require('../defaults.js');
const { RunCalibrationStatus } = require('../../../lib/domain/enums/RunCalibrationStatus.js');
const { runService } = require('../../../lib/server/services/run/RunService');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');
const { tag: { UpdateTagUseCase } } = require('../../../lib/usecases/index.js');

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

/**
 * Navigate to the details page of a given run
 *
 * @param {puppeteer.Page} page the puppeteer page
 * @param {number} runNumber the run number for which details should be displayed
 * @return {Promise<void>} resolves once the page is displayed
 */
const goToRunDetails = async (page, runNumber) => {
    await waitForNavigation(page, () => pressElement(page, '#run-overview'));
    await fillInput(page, '#runNumber', `${runNumber},${runNumber}`);
    return waitForNavigation(page, () => pressElement(page, `a[href="?page=run-detail&runNumber=${runNumber}"]`));
};

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
        await runService.create({ runNumber: 1010, timeTrgStart: new Date(), environmentId: 'CmCvjNbg' });
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
        await pressElement(page, '#edit-run');
        await pressElement(page, '#tags .popover-trigger');
        await pressElement(page, '#tags-dropdown-option-CPV');
        await pressElement(page, '#save-run');
        await pressElement(page, '#edit-run');
        await page.waitForSelector('#tags-dropdown-option-CPV:checked');
        await pressElement(page, '#cancel-run');
        await page.waitForSelector('#edit-run');
    });

    it('should display detectors names', async () => {
        const detectorNameSelector = '#detectors .detector-name';
        const detectorNames = await page.$$eval(detectorNameSelector, (detectors) => detectors.map((detector) => detector.innerText));
        const expectedDetectorNames =
            ['ACO', 'CPV', 'CTP', 'EMC', 'FDD', 'FIT', 'FT0', 'FV0', 'HMP', 'ITS']
                .concat(['MCH', 'MFT', 'MID', 'PHS', 'TOF', 'TPC', 'TRD', 'TST', 'ZDC']);
        expect(detectorNames).to.deep.equal(expectedDetectorNames);

        const presentDetectorNameSelector = '#detectors :is(.success, .danger) .detector-name';
        const presentDetectorName = await page.$eval(presentDetectorNameSelector, (detector) => detector.innerText);
        expect(presentDetectorName).to.equal('CPV');
    });

    it('should display detectors qualities and colors', async () => {
        const detectorBadgeClassesSelector = '#detectors .detector-badge';
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
        const svgPaths = await page.$$eval('#detectors .detector-quality-icon svg path', (elements) =>
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
        await pressElement(page, '#detectors .dropdown-trigger');

        const popoverSelector = await getPopoverSelector(await page.$('#detectors .popover-trigger'));
        await page.waitForSelector(`${popoverSelector} .dropdown`);

        const goodQualityRadioSelector = '#detector-quality-1-good';
        const badQualityRadioSelector = '#detector-quality-1-bad';
        expect(await page.$eval(goodQualityRadioSelector, (element) => element.checked)).to.be.true;
        expect(await page.$eval(badQualityRadioSelector, (element) => element.checked)).to.be.false;
        await pressElement(page, badQualityRadioSelector);
        await fillInput(page, '#detectors textarea', 'Justification');
        await pressElement(page, '#save-run');

        const detectorBadgeSelector = '#detectors .detector-badge:nth-child(2)';
        await page.waitForSelector(detectorBadgeSelector);
        const detectorBadgeClass = await page.$eval(detectorBadgeSelector, (element) => element.className);
        expect(detectorBadgeClass).to.contain('b-danger');
        expect(detectorBadgeClass).to.contain('danger');
        expect(await page.$eval(detectorBadgeSelector, (element) => element.innerText)).to.equal('CPV');
        expect(await page.$eval('#detectors .detector-badge:nth-child(2) .detector-quality-icon svg path', (element) =>
            element.getAttribute('d'))).to.equal(xIconPath);

        await pressElement(page, '#edit-run');
        await pressElement(page, '#detectors .dropdown-trigger');
        await page.waitForSelector('.dropdown');

        expect(await page.$eval(goodQualityRadioSelector, (element) => element.checked)).to.be.false;
        expect(await page.$eval(badQualityRadioSelector, (element) => element.checked)).to.be.true;
        await pressElement(page, '#save-run');
    });

    it('should successfully update end of run reasons', async () => {
        await pressElement(page, '#edit-run');

        await page.waitForSelector('#eor-reasons select');
        await page.select('#eor-reasons select', 'DETECTORS');

        await page.waitForSelector('#eor-reasons select:nth-child(2) option:nth-of-type(2)');
        await page.select('#eor-reasons select:nth-child(2)', 'CPV');
        await page.type('#eor-reasons input', 'A new EOR reason');
        await pressElement(page, '#add-eor-reason', true);
        // Flaky test, these options seem to fix it for now
        await page.waitForFunction(() => document.querySelectorAll('#eor-reasons .remove-eor-reason').length === 3, { polling: 'mutation' });

        // Remove the first EOR reason
        await pressElement(page, '.remove-eor-reason');
        await page.waitForFunction(() => document.querySelectorAll('#eor-reasons .remove-eor-reason').length === 2, { polling: 'mutation' });
        await pressElement(page, '#save-run');
        await page.waitForSelector('#edit-run');

        const eorReasons = await page.$$('#eor-reasons .eor-reason');

        expect(eorReasons).to.lengthOf(2);
        expect(await eorReasons[0].evaluate((element) => element.innerText))
            .to.equal('DETECTORS - TPC - Some Reason other than selected plus one');

        expect(await eorReasons[1].evaluate((element) => element.innerText))
            .to.equal('DETECTORS - CPV - A new EOR reason');
    });

    it('should successfully revert the update end of run reasons', async () => {
        await pressElement(page, '#edit-run');

        await page.waitForSelector('#eor-reasons select');
        await page.select('#eor-reasons select', 'OTHER');

        await page.waitForSelector('#eor-reasons select:nth-child(2)');
        await page.select('#eor-reasons select:nth-child(2)', 'Some-other');
        await page.type('#eor-reasons input', 'A new new EOR reason');
        await pressElement(page, '#add-eor-reason');

        // Remove the first EOR reason
        await pressElement(page, '.remove-eor-reason');
        await pressElement(page, '#cancel-run');
        await page.waitForSelector('#save-run', { hidden: true });

        const eorReasons = await page.$$('#eor-reasons .eor-reason');

        expect(eorReasons).to.lengthOf(2);
        expect(await eorReasons[0].evaluate((element) => element.innerText))
            .to.equal('DETECTORS - TPC - Some Reason other than selected plus one');

        expect(await eorReasons[1].evaluate((element) => element.innerText))
            .to.equal('DETECTORS - CPV - A new EOR reason');
    });

    it('should successfully update inelasticInteractionRate values of PbPb run', async () => {
        await goToRunDetails(page, 54);
        await pressElement(page, '#edit-run');
        await fillInput(page, '#inelastic-interaction-rate-avg input', 100.1);
        await fillInput(page, '#inelastic-interaction-rate-at-start input', 101.1);
        await fillInput(page, '#inelastic-interaction-rate-at-mid input', 102.1);
        await fillInput(page, '#inelastic-interaction-rate-at-end input', 103.1);

        await pressElement(page, '#save-run');
        // Wait for edition mode to be gone
        await page.waitForSelector('#edit-run');

        await expectInnerText(page, '#inelastic-interaction-rate-avg', '100.1\nHz');
        await expectInnerText(page, '#inelastic-interaction-rate-at-start', '101.1\nHz');
        await expectInnerText(page, '#inelastic-interaction-rate-at-mid', '102.1\nHz');
        await expectInnerText(page, '#inelastic-interaction-rate-at-end', '103.1\nHz');
    });

    it('should successfully update inelastic-interaction-rate-avg of pp run', async () => {
        await goToRunDetails(page, 55);
        await pressElement(page, '#edit-run');
        await fillInput(page, '#inelastic-interaction-rate-avg input', 100000);

        await pressElement(page, '#save-run');
        // Wait for edition mode to be gone
        await page.waitForSelector('#edit-run');

        await expectInnerText(page, '#inelastic-interaction-rate-avg', '100,000\nHz');
        await expectInnerText(page, '#mu-inelastic-interaction-rate', '0.009');
    });

    it('can navigate to the flp panel', async () => {
        await goToRunDetails(page, 1);
        await waitForNavigation(page, () => pressElement(page, '#flps-tab'));
        await expectUrlParams(page, {
            page: 'run-detail',
            runNumber: 1,
            panel: 'flps',
        });

        await waitForTableLength(page, 2);
        await expectRowValues(
            page,
            1,
            {
                name: 'FLP-TPC-1',
                hostname: 'someserver.cern.ch',
                nTimeframes: '18364758544493064720',
                bytesEquipmentReadOut: '16311.18 PB',
                meanSTFSize: '1 B',
                dataRate: '178.45 TB/s',
                bytesRecordingReadOut: '16311.18 PB',
                bytesFairMQReadOut: '16311.18 PB',
            },
        );
    });

    it('can navigate to the logs panel', async () => {
        await pressElement(page, '#logs-tab');
        await page.waitForSelector('#logs-tab.active');

        expectUrlParams(page, { page: 'run-detail', runNumber: 1, panel: 'logs' });
    });

    it('can navigate to a log detail page', async () => {
        // Lengh of 6 because of the test to change EoR reason which creates a log
        await waitForTableLength(page, 6);

        // We expect the entry page to have the same id as the id from the run overview
        await waitForNavigation(page, () => pressElement(page, '#row1 .btn-redirect'));

        expectUrlParams(page, { page: 'log-detail', id: 1 });
    });

    it('should successfully navigate to the trigger counters panel', async () => {
        await goToRunDetails(page, 1);

        await pressElement(page, '#ctp-trigger-counters-tab');
        await waitForTableLength(page, 2);
        expectUrlParams(page, { page: 'run-detail', runNumber: 1, panel: 'ctp-trigger-counters' });
        expect(await getTableContent(page)).to.deep.eql([
            ['FIRST-CLASS-NAME', '101', '102', '103', '104', '105', '106'],
            ['SECOND-CLASS-NAME', '2,001', '2,002', '2,003', '2,004', '2,005', '2,006'],
        ]);
    });

    it('should successfully navigate to the trigger configuration panel', async () => {
        await goToRunDetails(page, 1);

        await pressElement(page, '#trigger-configuration-tab');
        await expectInnerText(page, '#trigger-configuration-pane .panel', 'Raw\nTrigger\nConfiguration');
    });

    it('should show lhc data in normal mode', async () => {
        await expectInnerText(page, '#fill-number', 'Fill 5');
    });

    it('successfully prevent from editing run quality of not ended runs', async () => {
        await goToRunDetails(page, 105);

        await pressElement(page, '#edit-run');
        await page.waitForSelector('#cancel-run');
        expect(await page.$('#runQualitySelect')).to.be.null;
    });

    it('successfully prevent from editing detector\'s quality of not ended runs', async () => {
        await reloadPage(page);

        await pressElement(page, '#edit-run');
        await page.waitForSelector('#cancel-run');
        expect(await page.$('#detectors .dropdown-trigger')).to.be.null;
    });

    it('should successfully navigate to the LHC fill details page', async () => {
        await goToRunDetails(page, 108);

        await waitForNavigation(page, () => pressElement(page, '#fill-number a'));

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
        await goToRunDetails(page, 106);
        const runDurationCell = await page.waitForSelector('#runDurationValue');
        expect(await runDurationCell.$('.popover-trigger')).to.be.null;
        expect(await runDurationCell.evaluate((element) => element.innerText)).to.equal('25:00:00');
    });

    it('should successfully display duration without warning popover when run has trigger OFF', async () => {
        await goToRunDetails(page, 107);
        const runDurationCell = await page.waitForSelector('#runDurationValue');
        expect(await runDurationCell.$('.popover-trigger')).to.be.null;
        expect(await runDurationCell.evaluate((element) => element.innerText)).to.equal('25:00:00');
    });

    it('should successfully display UNKNOWN without warning popover when run last for more than 48 hours', async () => {
        await goToRunDetails(page, 105);
        const runDurationCell = await page.waitForSelector('#runDurationValue');
        expect(await runDurationCell.$('.popover-trigger')).to.be.null;
        expect(await runDurationCell.evaluate((element) => element.innerText)).to.equal('UNKNOWN');
    });

    it('should successfully display popover warning when run is missing trigger start', async () => {
        await goToRunDetails(page, 104);
        const popoverContent = await getPopoverContent(await page.waitForSelector('#runDurationValue .popover-trigger'));
        expect(popoverContent).to.equal('Duration based on o2 start because of missing trigger start information');
    });

    it('should successfully display popover warning when run is missing trigger stop', async () => {
        await goToRunDetails(page, 103);
        const popoverContent = await getPopoverContent(await page.waitForSelector('#runDurationValue .popover-trigger'));
        expect(popoverContent).to.equal('Duration based on o2 stop because of missing trigger stop information');
    });

    it('should successfully display popover warning when run is missing trigger start and stop', async () => {
        await goToRunDetails(page, 102);
        const popoverContent = await getPopoverContent(await page.waitForSelector('#runDurationValue .popover-trigger'));
        expect(popoverContent).to.equal('Duration based on o2 start AND stop because of missing trigger information');
    });

    it('should successfully display user that started run', async () => {
        await goToRunDetails(page, 1);
        const popoverContent = await getPopoverContent(await page.waitForSelector('#user-start-tooltip .popover-trigger'));
        expect(popoverContent).to.equal('Run started by John Doe');
    });

    it('should successfully display user that stopped run', async () => {
        await goToRunDetails(page, 1);
        const popoverContent = await getPopoverContent(await page.waitForSelector('#user-stop-tooltip .popover-trigger'));
        expect(popoverContent).to.equal('Run stopped by Jan Jansen');
    });

    it('should display OFF in the nEPNs field when EPNs is null', async () => {
        await goToRunDetails(page, 3);
        await expectInnerText(page, '#n-epns', '# EPNs\nOFF');
    });

    it('should not display OFF in the nEPNs field when EPNs is not null', async () => {
        await goToRunDetails(page, 106);
        await expectInnerText(page, '#n-epns', '# EPNs\n12');
    });

    it('should not display calibration status on non-calibration runs', async () => {
        await page.waitForSelector('#definition');
        await page.waitForSelector('#definition #calibration-status', { hidden: true });
    });

    it('should display calibration status on calibration runs', async () => {
        await goToRunDetails(page, 40);
        await page.waitForSelector('#calibration-status');
        await expectInnerText(page, '#calibration-status', RunCalibrationStatus.NO_STATUS);
    });

    it('should allow to update calibration status on calibration runs', async () => {
        const runNumber = 40;
        await goToPage(page, 'run-detail', { queryParameters: { runNumber: runNumber } });
        await expectInnerText(page, '#calibration-status', RunCalibrationStatus.NO_STATUS);
        await pressElement(page, '#edit-run');
        await page.waitForSelector('#calibration-status select');
        await page.select('#calibration-status select', RunCalibrationStatus.SUCCESS);
        await pressElement(page, '#save-run');

        // Wait for page to be reloaded
        await page.waitForSelector('#edit-run');
        await expectInnerText(page, '#calibration-status', RunCalibrationStatus.SUCCESS);
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

        await expectInnerText(page, '#non-stable-beam-message', 'No LHC Fill information, beam mode was: UNSTABLE BEAMS');
    });

    it('should successfully display a link to related enviroment', async () => {
        page.waitForSelector('a href="http://localhost:4000/?page=env-details&environmentId=CmCvjNbg"');
    });

    it('should successfully display links to infologger and QCG', async () => {
        await waitForNavigation(page, () => pressElement(page, 'a#run-overview'));
        await waitForNavigation(page, () => pressElement(page, '#row108 a'));

        await expectLink(page, 'a.external-link', {
            innerText: 'FLP',
            href: 'http://localhost:8081/?q={%22run%22:{%22match%22:%22108%22},%22severity%22:{%22in%22:%22W%20E%20F%22}}',
        });
        await expectLink(page, 'a.external-link:nth-of-type(2)', {
            innerText: 'QCG',
            href: 'http://localhost:8082/?page=layoutShow&runNumber=108&definition=PHYSICS&pdpBeamType=pp&runType=PHYSICS',
        });
    });

    it('should display links to environment in ECS if run is running', async () => {
        await goToRunDetails(page, 104);

        await page.waitForSelector('a.external-link:nth-of-type(3)', { hidden: true, timeout: 250 });

        // Create running run
        await goToRunDetails(page, '1010');

        await expectUrlParams(page, { page: 'run-detail', runNumber: '1010' });
        await page.waitForSelector('.alert.alert-danger', { hidden: true, timeout: 300 });
        await expectInnerText(page, '#runDurationValue', 'RUNNING');

        await expectLink(page, 'a.external-link:nth-of-type(4)', {
            href: 'http://localhost:8080/?page=environment&id=CmCvjNbg',
            innerText: 'ECS',
        });
    });

    it('should display correct tag styling after updating in tag overview', async () => {
        /**
         *  Retrieve the badge classes and styles
         *
         *  @return {Promise<Array>} resolves with the badge classes and styles
         */
        const getRunTagsBadges = async () => {
            // Check if the tag is updated
            const tagsBadgeClassesSelector = '#tags .badge';
            // Wait for badge elements to appear
            await page.waitForSelector(tagsBadgeClassesSelector);
            // Evaluate and check for inline background color
            return await page.$$eval(
                tagsBadgeClassesSelector,
                (badges) => badges.map((badge) => badge.style.backgroundColor),
            );
        };

        let badges;
        const expectedBgColorBefore = 'rgb(238, 238, 238)'; //Gray
        const expectedBgColorAfter = 'rgb(255, 0, 0)'; //Red
        const expectedBadgeCount = 7;

        // Fetch the run data before update of tag
        await goToRunDetails(page, 106);

        badges = await getRunTagsBadges();

        expect(badges.length).to.equal(expectedBadgeCount);

        expect(badges[0]).to.equal(expectedBgColorBefore);

        const updateTagDto = {
            body: {
                color: '#FF0000', //Red
            },
            params: {
                tagId: 1,
            },
            session: {
                personid: 1,
                id: 1,
                name: 'John Doe',
            },
        };
        await new UpdateTagUseCase()
            .execute(updateTagDto);

        await goToRunDetails(page, 106);
        badges = await getRunTagsBadges();

        expect(badges[0]).to.equal(expectedBgColorAfter);
    });
};
