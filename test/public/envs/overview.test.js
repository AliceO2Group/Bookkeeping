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
    checkColumnBalloon,
    validateTableData,
    expectInnerText,
    expectUrlParams,
    waitForNavigation,
    getInnerText,
    waitForTableLength,
} = require('../defaults.js');
const dateAndTime = require('date-and-time');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');

const { expect } = chai;

module.exports = () => {
    let page;
    let browser;

    before(async () => {
        [page, browser] = await defaultBefore(page, browser);
        await page.setViewport({
            width: 700,
            height: 720,
            deviceScaleFactor: 1,
        });

        await resetDatabaseContent();
    });

    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('loads the page successfully', async () => {
        const response = await goToPage(page, 'env-overview');

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');
    });

    it('shows correct datatypes in respective columns', async () => {
        await goToPage(page, 'env-overview');

        const { StatusAcronym, STATUS_ACRONYMS } = await import('../../../lib/public/domain/enums/statusAcronym.mjs');

        const statusNames = new Set(Object.keys(StatusAcronym));

        // eslint-disable-next-line require-jsdoc
        const checkDate = (date) => !isNaN(dateAndTime.parse(date, 'DD/MM/YYYY hh:mm:ss'));
        const tableDataValidators = {
            id: (id) => /[A-Za-z0-9]+/.test(id),
            runs: (runs) => runs === '-' || runs.split(',').every((run) => !isNaN(run)),
            createdAt: checkDate,
            updatedAt: checkDate,
            status: (currentStatus) => statusNames.has(currentStatus),
            historyItems: (history) => history.split('-').every((statusAcronym) => STATUS_ACRONYMS.includes(statusAcronym)),
        };
        await validateTableData(page, new Map(Object.entries(tableDataValidators)));
    });

    it('Should display the correct items counter at the bottom of the page', async () => {
        await goToPage(page, 'env-overview');

        await expectInnerText(page, '#firstRowIndex', '1');
        await expectInnerText(page, '#lastRowIndex', '9');
        await expectInnerText(page, '#totalRowsCount', '9');
    });

    it('Should have balloon on runs column', async () => {
        await goToPage(page, 'env-overview');

        await checkColumnBalloon(page, 1, 2);
        await checkColumnBalloon(page, 1, 6);
    });

    it('Should have correct status color in the overview page', async () => {
        await goToPage(page, 'env-overview');

        /**
         * Check that a given cell of the given column displays the correct color depending on the status
         *
         * @param {number} rowIndex the index of the row to look for status color
         * @param {number} columnIndex the index of the column to look for status color
         * @returns {Promise<Chai.Assertion>} void promise
         */
        const checkEnvironmentStatusColor = async (rowIndex, columnIndex) => {
            const cellSelector = `tbody tr:nth-of-type(${rowIndex}) td:nth-of-type(${columnIndex})`;
            const cell = await page.waitForSelector(cellSelector);
            const cellContent = await getInnerText(cell);

            switch (cellContent) {
                case 'RUNNING':
                    await page.waitForSelector(`${cellSelector}.success`);
                    break;
                case 'ERROR':
                    await page.waitForSelector(`${cellSelector}.danger`);
                    break;
                case 'CONFIGURED':
                    await page.waitForSelector(`${cellSelector}.warning`);
                    break;
            }
        };

        await checkEnvironmentStatusColor(1, 4);
        await checkEnvironmentStatusColor(2, 4);
        await checkEnvironmentStatusColor(3, 4);
        await checkEnvironmentStatusColor(4, 4);
    });

    it('can set how many environments are available per page', async () => {
        // Expect the amount selector to currently be set to 10 (because of the defined page height)
        const amountSelectorId = '#amountSelector';
        const amountSelectorButton = await page.waitForSelector(`${amountSelectorId} button`);
        const amountSelectorButtonText = await page.evaluate((element) => element.innerText, amountSelectorButton);
        expect(amountSelectorButtonText.trim().endsWith('10')).to.be.true;

        // Expect the dropdown options to be visible when it is selected
        await pressElement(page, `${amountSelectorId} button`);
        await page.waitForSelector(`${amountSelectorId} .dropup-menu`);

        // Expect the amount of visible environments to reduce when the first option (5) is selected
        await pressElement(page, `${amountSelectorId} .dropup-menu .menu-item`);
        await waitForTableLength(page, 5);

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
        await goToPage(page, 'env-overview');

        // Override the amount of runs visible per page manually
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.envs.overviewModel.pagination.itemsPerPage = 1;
        });
        await waitForTableLength(page, 1);

        // Expect the page five button to now be visible, but no more than that
        await page.waitForSelector('#page5');
        await page.waitForSelector('#page6', { hidden: true });

        // Expect the page one button to have fallen away when clicking on page five button
        await pressElement(page, '#page5');
        await page.waitForSelector('#page1', { hidden: true });
    });

    it('should successfully display the list of related runs as hyperlinks to their details page', async () => {
        await goToPage(page, 'env-overview');
        await waitForNavigation(page, () => pressElement(page, '#rowTDI59So3d-runs a'));
        expectUrlParams(page, { page: 'run-detail', runNumber: 103 });
    });
};
