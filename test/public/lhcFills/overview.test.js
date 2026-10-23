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
    pressElement,
    goToPage,
    waitForNavigation,
    expectUrlParams,
    expectInnerText,
    waitForTableLength,
    expectLink,
    openFilteringPanel,
    expectAttributeValue,
    fillInput,
    getPeriodInputsSelectors,
    getPopoverSelector,
} = require('../defaults.js');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');

const { expect } = chai;

const percentageRegex = new RegExp(/\d{1,2}.\d{2}%/);
const durationRegex = new RegExp(/\d{2}:\d{2}:\d{2}/);

const defaultViewPort = {
    width: 700,
    height: 763,
    deviceScaleFactor: 1,
};

const testResizeViewPort = {
    width: 700,
    height: 391,
    deviceScaleFactor: 1,
};

const bottomNavBarSelector = `div.flex-row:nth-child(2)`;


module.exports = () => {
    let page;
    let browser;

    before(async () => {
        [page, browser] = await defaultBefore(page, browser);
        await page.setViewport(defaultViewPort);
        await resetDatabaseContent();
    });

    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('loads the page successfully', async () => {
        const response = await goToPage(page, 'lhc-fill-overview');

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');
    });

    // in case the 'should resize table accordingly' fails we still want to fix the viewport size to default values.
    describe("viewport changing tests", async () => {
        afterEach(async () => {
            await page.setViewport(defaultViewPort);
        });

        it('should resize table accordingly', async () => {
            await goToPage(page, 'lhc-fill-overview');
             // turn off Stable Beams Only filter
            await pressElement(page, '.slider.round');
            // 6 rows non stable beam in test data
            // document.documentElement.clientHeight = 391 should result in 3 rows.
            await waitForTableLength(page, 6);
            await page.setViewport(testResizeViewPort);
            await waitForTableLength(page, 3);
            const bottomNavBar = await page.$(bottomNavBarSelector);
            expect(await bottomNavBar.isIntersectingViewport()).to.be.true

            await page.setViewport(defaultViewPort);
            await waitForTableLength(page, 6);
        });
    });

    

    it('shows correct datatypes in respective columns', async () => {
        // Expectations of the datatype of the values displayed in the merged cells, identified by the suffix of the id of their element
        const valuesDatatypes = {
            'fill-number': (fill) => !isNaN(parseInt(fill, 10)),
            efficiencyValue: (efficiency) => efficiency === '-' || efficiency.match(percentageRegex) !== null,
            timeLossAtStart: (data) => data === '-'
                || data.match(new RegExp(`${durationRegex.source} \\(${percentageRegex.source}\\)`)) !== null,
            meanRunDuration: (duration) => duration === '-' || duration.match(durationRegex) !== null,
            runsCoverage: (duration) => duration === '-' || duration.match(durationRegex) !== null,
        };

        // Use the third row because it is where statistics are present, once the table is loaded
        await page.waitForSelector('tbody tr:nth-of-type(3) [id$="-fill-number"]');

        for (const [suffix, isOfExpectedDatatype] of Object.entries(valuesDatatypes)) {
            const value = await page.$eval(`tbody tr:nth-of-type(3) [id$="-${suffix}"]`, (element) => element.innerText);
            expect(isOfExpectedDatatype(value), `${suffix} has an unexpected value: ${value}`).to.be.true;
        }
    });

    it('Should display the correct items counter at the bottom of the page', async () => {
        await goToPage(page, 'lhc-fill-overview');

        await expectInnerText(page, '#firstRowIndex', '1');
        await expectInnerText(page, '#lastRowIndex', '5');
        await expectInnerText(page, '#totalRowsCount', '5');
    });

    it('fill dropdown menu should be correct', async() => {
        const popoverTrigger = '#row6-fill-number .popover-trigger';

        await pressElement(page, popoverTrigger);
        await expectInnerText(page, '#copy-6 > div:nth-child(1)', 'Copy Fill Number');
        
        const popoverSelector = await getPopoverSelector(await page.waitForSelector(popoverTrigger));


        await expectLink(page, `${popoverSelector} a:nth-of-type(2)`, {
            href: `http://localhost:4000/?page=log-create&lhcFillNumbers=6`, innerText: ' Add log to this fill'
        })
        // disable the popover
        await pressElement(page, popoverTrigger)
    })

    it('can set how many lhcFills are available per page', async () => {
         // turn off Stable Beams Only filter
        await pressElement(page, '.slider.round');

        // Expect the amount selector to currently be set to 9 (because of the defined page height)
        const amountSelectorId = '#amountSelector';
        const amountSelectorButton = await page.$(`${amountSelectorId} button`);
        const amountSelectorButtonText = await page.evaluate((element) => element.innerText, amountSelectorButton);
        expect(amountSelectorButtonText.trim().endsWith('9')).to.be.true;

        // Expect the dropdown options to be visible when it is selected
        await pressElement(page, `${amountSelectorId} button`);
        await page.waitForSelector(`${amountSelectorId} .dropup-menu`);

        // Expect the amount of visible lhcFills to reduce when the first option (5) is selected
        await pressElement(page, `${amountSelectorId} .dropup-menu .menu-item`);
        await waitForTableLength(page, 5);

        const tableRows = await page.$$('table tr');
        expect(tableRows.length - 1).to.equal(5);

        // Expect the custom per page input to have red border and text color if wrong value typed
        const customPerPageInput = await page.$(`${amountSelectorId} input[type=number]`);
        await customPerPageInput.evaluate((input) => input.focus());
        await page.$eval(`${amountSelectorId} input[type=number]`, (el) => {
            el.value = '1111';
            el.dispatchEvent(new Event('input'));
        });
        await page.waitForSelector(`${amountSelectorId} input:invalid`);
    });

    it('dynamically switches between visible pages in the page selector', async () => {
        // The page selector of phones (screens narrower than 768px) only displays the three page buttons nearest to the current one
        const viewport = page.viewport();
        await page.setViewport({ ...viewport, width: 800 });
        try {
            await goToPage(page, 'lhc-fill-overview');

            // turn off Stable Beams Only filter
            await pressElement(page, '.slider.round');


            // Override the amount of lhc fills visible per page manually
            await page.evaluate(() => {
                // eslint-disable-next-line no-undef
                model.lhcFills.overviewModel.pagination.itemsPerPage = 1;
            });
            await waitForTableLength(page, 1);

            // Expect the page five button to now be visible, but no more than that
            const pageFiveButton = await page.$('#page5');
            expect(pageFiveButton).to.be.not.null;
            const pageSixButton = await page.$('#page6');
            expect(pageSixButton).to.be.null;

            // Expect the page one button to have fallen away when clicking on page five button
            await pressElement(page, '#page5');
            await page.waitForSelector('#page1', { hidden: true });
        } finally {
            await page.setViewport(viewport);
        }    });

    it('should successfully navigate to the LHC fill details page', async () => {
        await goToPage(page, 'lhc-fill-overview');
        await waitForNavigation(page, () => pressElement(page, 'td:first-of-type a'));
        expectUrlParams(page, { page: 'lhc-fill-details', fillNumber: '6' });
    });

    it('should successfully display ONGOING information', async () => {
        await goToPage(page, 'lhc-fill-overview');
        const stableBeamsDurationText = await page.waitForSelector('#row5-stableBeamsDuration .badge');

        expect(await stableBeamsDurationText.evaluate((element) => element.classList.contains('bg-success'))).to.be.true;
        expect(await stableBeamsDurationText.evaluate((element) => element.innerText)).to.equal('ONGOING');
    });

    it('should successfully display the list of related runs as hyperlinks to their details page', async () => {
        await goToPage(page, 'lhc-fill-overview');
        await waitForNavigation(page, () => pressElement(page, '#row6-runs a'));
        expectUrlParams(page, { page: 'run-detail', runNumber: '49' });
    });

    it('should successfully display some statistics', async () => {
        await goToPage(page, 'lhc-fill-overview');

        await expectInnerText(page, '#row6-beamType', 'O8 - O8');
        await expectInnerText(page, '#row6-timeLossAtStart', '03:00:00 (25.00%)');
        await expectInnerText(page, '#row6-collidingBunches', '1024');
        await expectInnerText(page, '#row6-meanRunDuration', '01:40:00');
        await expectInnerText(page, '#row6-runsCoverage', '05:00:00');
        await expectInnerText(page, '#row6-efficiencyValue', '41.67%');
        await expectInnerText(page, '#row6-schemeName', 'Single_12b_8_1024_8_2018');
    });

    it('should successfully display the start, the end and the duration of the stable beams', async () => {
        await goToPage(page, 'lhc-fill-overview');

        // Fill 6 ends the same day it started: only the time of its end is displayed, aligned with the time of its start
        await expectInnerText(page, '#row6-stableBeamsStart', '08/08/2019, 11:00:00');
        await expectInnerText(page, '#row6-stableBeamsEnd', '23:00:00');
        await expectInnerText(page, '#row6-stableBeamsDuration', '12:00:00');

        // Fill 3 ends the day after its start: the date of its end is displayed
        await expectInnerText(page, '#row3-stableBeamsStart', '21/03/2022, 13:00:00');
        await expectInnerText(page, '#row3-stableBeamsEnd', '22/03/2022, 15:00:00');
    });

    it('should successfully display filter elements', async () => {
        const filterSBExpect = { selector: '.stableBeams-filter .w-30', value: 'Stable Beams Only' };
        const filterFillNRExpect = {selector: 'div.items-baseline:nth-child(1) > div:nth-child(1)', value: 'Fill #'};
        const filterSBStartExpect = {selector: 'div.items-baseline:nth-child(2) > div:nth-child(1)', value: 'SB START'};
        const filterSBEndExpect = {selector: 'div.items-baseline:nth-child(3) > div:nth-child(1)', value: 'SB END'};
        const filterSBDurationExpect = {selector: 'div.items-baseline:nth-child(5) > div:nth-child(1)', value: 'SB Duration'};
        const filterSBDurationPlaceholderExpect = {selector: '#beam-duration-filter-operand', value: 'e.g 16:14:15 (HH:MM:SS)'}
        const filterRunDurationExpect = {selector: 'div.flex-row:nth-child(6) > div:nth-child(1)', value: 'Total runs duration'}
        const filterRunDurationPlaceholderExpect = {selector: '#run-duration-filter-operand', value: 'e.g 16:14:15 (HH:MM:SS)'};
        const filterSBDurationOperatorExpect = { value: true };
        const filterBeamTypeExpect = {selector: 'div.flex-row:nth-child(7) > div:nth-child(1)', value: 'Beam Type'}
        const filterSchemeNamePlaceholderExpect = {selector: '.fillingSchemeName-filter input', value: 'e.g. Single_12b_8_1024_8_2018'}
        
        await goToPage(page, 'lhc-fill-overview');
        // Open the filtering panel
        await openFilteringPanel(page);
        // Note: expectAttributeValue does not work here.
        expect(await page.evaluate(() => document.querySelector('#beam-duration-filter-operator > option:nth-child(3)').selected)).to.equal(filterSBDurationOperatorExpect.value);
        await expectInnerText(page, filterSBExpect.selector, filterSBExpect.value);
        await expectInnerText(page, filterFillNRExpect.selector, filterFillNRExpect.value);
        await expectInnerText(page, filterSBStartExpect.selector, filterSBStartExpect.value);
        await expectInnerText(page, filterSBEndExpect.selector, filterSBEndExpect.value);
        await expectInnerText(page, filterSBDurationExpect.selector, filterSBDurationExpect.value);
        await expectAttributeValue(page, filterSBDurationPlaceholderExpect.selector, 'placeholder', filterSBDurationPlaceholderExpect.value);
        await expectInnerText(page, filterRunDurationExpect.selector, filterRunDurationExpect.value);
        await expectAttributeValue(page, filterRunDurationPlaceholderExpect.selector, 'placeholder', filterRunDurationPlaceholderExpect.value);
        await expectInnerText(page, filterBeamTypeExpect.selector, filterBeamTypeExpect.value);
        await expectAttributeValue(page, filterSchemeNamePlaceholderExpect.selector, 'placeholder', filterSchemeNamePlaceholderExpect.value);
    });

    it('should successfully un-apply Stable Beam filter menu', async () => {
        const filterButtonSBOnlySelector= '#stableBeamsOnlyRadioOFF';
        await goToPage(page, 'lhc-fill-overview');
        await waitForTableLength(page, 5);
        // Open the filtering panel
        await openFilteringPanel(page);
        await pressElement(page, filterButtonSBOnlySelector);
        await waitForTableLength(page, 6);
    });

    it('should successfully turn off stable beam only from header', async () => {
        await goToPage(page, 'lhc-fill-overview');
        await waitForTableLength(page, 5);
        await pressElement(page, '.slider.round');
        await waitForTableLength(page, 6);
    });

    it('should successfully apply beam duration filter', async () => {
        const filterSBDurationOperator= '#beam-duration-filter-operator';
        const filterSBDurationOperand= '#beam-duration-filter-operand';
        await goToPage(page, 'lhc-fill-overview');
        await waitForTableLength(page, 5);
        // Open the filtering panel
        await openFilteringPanel(page);
        await page.select(filterSBDurationOperator, '>=');
        await fillInput(page, filterSBDurationOperand, '00:01:40', ['change']);
        await waitForTableLength(page, 4);
    });

    it('should successfully apply run duration filter', async () => {
        const filterRunDurationOperator= '#run-duration-filter-operator';
        const filterRunDurationOperand= '#run-duration-filter-operand';
        await goToPage(page, 'lhc-fill-overview');
        await waitForTableLength(page, 5);
        // Open the filtering panel
        await openFilteringPanel(page);
        await page.select(filterRunDurationOperator, '<=');
        await fillInput(page, filterRunDurationOperand, '00:00:00', ['change']);
        await waitForTableLength(page, 4);
        await page.select(filterRunDurationOperator, '>=');
        await fillInput(page, filterRunDurationOperand, '00:00:00', ['change']);
        await waitForTableLength(page, 5);
    });

    it('should successfully apply beam types filter', async () => {
        const filterBeamTypeP_Pb = '[id="beam-types-dropdown-option-PROTON - O8"]';
        const filterBeamTypePb_Pb = '[id="beam-types-dropdown-option-PB82 - PB82"]';

        await goToPage(page, 'lhc-fill-overview');
        await waitForTableLength(page, 5);

        await openFilteringPanel(page);
        await pressElement(page, '.beamType-filter .dropdown-trigger', true);
        await pressElement(page, filterBeamTypeP_Pb);
        await waitForTableLength(page, 1);
    
        await pressElement(page, filterBeamTypePb_Pb);
        await waitForTableLength(page, 2);
    });

    it('should successfully apply stableBeamStart filter', async () => {
        const popoverTrigger = '.stableBeamsStart-filter .popover-trigger';

        await goToPage(page, 'lhc-fill-overview');
        await waitForTableLength(page, 5);
        await page.waitForSelector('#row6-stableBeamsStart');
        await openFilteringPanel(page);

        const popOverSelector = await getPopoverSelector(await page.$(popoverTrigger));
        const { fromDateTimeSelector, toDateTimeSelector } = getPeriodInputsSelectors(popOverSelector);

        await fillInput(page, fromDateTimeSelector, '2019-08-08T10:00', ['change']);
        await fillInput(page, toDateTimeSelector, '2019-08-08T12:00', ['change']);
        
        await openFilteringPanel(page);
        await pressElement(page, popoverTrigger);
        await waitForTableLength(page, 1);
    });

    it('should successfully apply stableBeamEnd filter', async () => {
        const popoverTrigger = '.stableBeamsEnd-filter .popover-trigger';

        await goToPage(page, 'lhc-fill-overview');
        await waitForTableLength(page, 5);
        await page.waitForSelector('#row6-stableBeamsEnd');
        await openFilteringPanel(page);

        const popOverSelector = await getPopoverSelector(await page.$(popoverTrigger));
        const { fromDateTimeSelector, toDateTimeSelector } = getPeriodInputsSelectors(popOverSelector);

        await fillInput(page, fromDateTimeSelector, '2022-03-22T01:00', ['change']);
        await fillInput(page, toDateTimeSelector, '2022-03-22T23:59', ['change']);
        await openFilteringPanel(page);
        await pressElement(page, popoverTrigger);
        await waitForTableLength(page, 3);
    });

    it('should successfully apply scheme name filter', async () => {
        const filterSchemeNameInputField= '.fillingSchemeName-filter input';
        await goToPage(page, 'lhc-fill-overview');
        await waitForTableLength(page, 5);

        await openFilteringPanel(page);
        await fillInput(page, filterSchemeNameInputField, 'Single_12b_8_1024_8_2018', ['change']);
        await waitForTableLength(page, 1);
    });
};
