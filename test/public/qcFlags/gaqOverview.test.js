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
    goToPage,
    validateTableData,
    expectUrlParams,
    waitForNavigation,
    getTableContent,
    getPopoverSelector,
    getPopoverContent,
} = require('../defaults.js');

const { expect } = chai;
const dateAndTime = require('date-and-time');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');

/**
 * Navigate to Runs per Data Pass page
 *
 * @param {Puppeteer.page} page page
 * @param {number} params.lhcPeriodId id of lhc period on LHC Period overview page
 * @param {number} params.dataPassId id of data pass on Data Passes per LHC Period page
 * @return {Promise<void>} promise
 */
const navigateToRunsPerDataPass = async (page, { lhcPeriodId, dataPassId }) => {
    await waitForNavigation(page, () => pressElement(page, 'a#lhc-period-overview', true));
    await waitForNavigation(page, () => pressElement(page, `#row${lhcPeriodId}-associatedDataPasses a`, true));
    expectUrlParams(page, { page: 'data-passes-per-lhc-period-overview', lhcPeriodId });
    await page.waitForSelector('th#description');
    await waitForNavigation(page, () => pressElement(page, `#row${dataPassId}-associatedRuns a`, true));
    expectUrlParams(page, { page: 'runs-per-data-pass', dataPassId });
};

module.exports = () => {
    let page;
    let browser;

    before(async () => {
        [page, browser] = await defaultBefore(page, browser);
        await page.setViewport({
            width: 1200,
            height: 720,
            deviceScaleFactor: 1,
        });
        await resetDatabaseContent();
    });

    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('loads the page successfully', async () => {
        const response = await goToPage(page, 'gaq-flags', { queryParameters: {
            dataPassId: 1,
            runNumber: 106,
        } });

        expect(response.status()).to.equal(200);

        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');

        await expectInnerText(page, 'h2:nth-of-type(1)', 'GAQ');
        await expectInnerText(page, 'h2:nth-of-type(2)', 'LHC22b_apass1');
        await expectInnerText(page, 'h2:nth-of-type(3)', '106');
    });

    it('shows correct datatypes in respective columns', async () => {
        // eslint-disable-next-line require-jsdoc
        const validateDate = (date) => date === '-' || !isNaN(dateAndTime.parse(date, 'DD/MM/YYYY hh:mm:ss'));
        const tableDataValidators = {
            generalQuality: (generalQuality) => ['good', 'bad', 'MC.R'].includes(generalQuality),
            from: (timestamp) => timestamp === 'Whole run coverage' || validateDate(timestamp),
            to: (timestamp) => timestamp === 'Whole run coverage' || validateDate(timestamp),
        };

        await validateTableData(page, new Map(Object.entries(tableDataValidators)));

        expect(await getTableContent(page)).to.have.all.deep.ordered.members([
            [
                'MC.R',
                '08/08/2019\n22:43:20',
                '09/08/2019\n04:16:40',
                'Limited Acceptance MC Reproducible',
                '',
            ],
            [
                'bad',
                '09/08/2019\n05:40:00',
                '09/08/2019\n07:03:20',
                'Limited acceptance',
                '',
            ],
            [
                'bad',
                '09/08/2019\n08:26:40',
                '09/08/2019\n09:50:00',
                'Bad',
                '',
            ],
        ]);

        await waitForNavigation(page, () => pressElement(page, 'h2:nth-of-type(2) a'));
        await waitForNavigation(page, () => pressElement(page, '#row106-EMC a'));
        await pressElement(page, '#flag-type-panel .popover-trigger');
        await pressElement(page, '#flag-type-dropdown-option-3', true);

        await page.waitForSelector('button#submit[disabled]', { hidden: true, timeout: 250 });
        await waitForNavigation(page, () => pressElement(page, 'button#submit'));

        await waitForNavigation(page, () => pressElement(page, 'h2:nth-of-type(2) a'));
        await waitForNavigation(page, () => pressElement(page, '#row106-globalAggregatedQuality a'));

        expect(await getTableContent(page)).to.have.all.deep.ordered.members([
            [
                'good',
                '08/08/2019\n13:00:00',
                '08/08/2019\n22:43:20',
                '',
                'Good',
            ],
            [
                'MC.R',
                '08/08/2019\n22:43:20',
                '09/08/2019\n04:16:40',
                'Limited Acceptance MC Reproducible',
                'Good',
            ],
            [
                'good',
                '09/08/2019\n04:16:40',
                '09/08/2019\n05:40:00',
                '',
                'Good',
            ],
            [
                'bad',
                '09/08/2019\n05:40:00',
                '09/08/2019\n07:03:20',
                'Limited acceptance',
                'Good',
            ],
            [
                'good',
                '09/08/2019\n07:03:20',
                '09/08/2019\n08:26:40',
                '',
                'Good',
            ],
            [
                'bad',
                '09/08/2019\n08:26:40',
                '09/08/2019\n09:50:00',
                'Bad',
                'Good',
            ],
            [
                'good',
                '09/08/2019\n09:50:00',
                '09/08/2019\n14:00:00',
                '',
                'Good',
            ],
        ]);

        let popoverSelector = await getPopoverSelector(page, 'tbody tr:nth-of-type(1) td .popover-trigger');
        expect(await getPopoverContent(page, popoverSelector)).to.be.equal('No flag for some detector\nAt least one flag is not verified');

        popoverSelector = await getPopoverSelector(page, 'tbody tr:nth-of-type(2) td .popover-trigger');
        expect(await getPopoverContent(page, popoverSelector)).to.be.equal('At least one flag is not verified');

        await waitForNavigation(page, () => pressElement(page, 'tbody tr:nth-of-type(2) td:neth-of-type() a'));
    });
};
