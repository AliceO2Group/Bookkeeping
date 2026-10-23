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
    checkColumnBalloon,
    expectLink,
    expectInnerText,
    expectUrlParams,
    waitForNavigation,
    waitForTableLength,
    getPopoverSelector,
    goToPage,
    openFilteringPanel,
    fillInput,
    getPeriodInputsSelectors,
    expectAttributeValue,
    resetFilters,
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
        await goToPage(page, 'env-overview');

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');
    });

    it('shows correct datatypes in respective columns', async () => {
        const { StatusAcronym, STATUS_ACRONYMS } = await import('../../../lib/public/domain/enums/statusAcronym.mjs');

        const statusNames = new Set(Object.keys(StatusAcronym));

        const checkDate = (date) => !isNaN(dateAndTime.parse(date, 'DD/MM/YYYY, HH:mm:ss'));
        const durationRegex = /^\d{2,}:\d{2}:\d{2}$/;

        await page.waitForSelector('tbody tr:nth-of-type(1) [id$="-statusChain"]');
        const rows = await page.$$eval('tbody tr', (trs) => trs.map((tr) => {
            const text = (suffix) => tr.querySelector(`[id$="-${suffix}"]`)?.innerText;
            return {
                id: text('id'),
                currentStatus: text('currentStatus'),
                createdAt: text('createdAt'),
                statusChain: tr.querySelector('[id$="-statusChain"]')?.textContent,
                total: tr.querySelector('[id$="-statusSummary"] span:nth-child(1) span')?.innerText,
                running: tr.querySelector('[id$="-statusSummary"] span:nth-child(2) span')?.innerText,
                runs: text('runs'),
            };
        }));

        expect(rows).to.have.length.greaterThan(0);
        for (const row of rows) {
            expect(row.id, `id of ${JSON.stringify(row)}`).to.match(/^[A-Za-z0-9]+$/);
            expect(statusNames.has(row.currentStatus), `status of ${row.id}`).to.be.true;
            expect(checkDate(row.createdAt), `creation date of ${row.id}: ${row.createdAt}`).to.be.true;
            expect(
                row.statusChain.split('\u203A').every((statusAcronym) => STATUS_ACRONYMS.includes(statusAcronym)),
                `status history of ${row.id}: ${row.statusChain}`,
            ).to.be.true;
            expect(row.total, `total time of ${row.id}`).to.match(durationRegex);
            expect(row.running, `running time of ${row.id}`).to.match(durationRegex);
            expect(row.runs === '-' || row.runs.split(',').every((run) => !isNaN(run)), `runs of ${row.id}: ${row.runs}`).to.be.true;
        }
    });

    it('Should display the correct items counter at the bottom of the page', async () => {
        await expectInnerText(page, '#firstRowIndex', '1');
        await expectInnerText(page, '#lastRowIndex', '7');
        await expectInnerText(page, '#totalRowsCount', '9');
    });

    it('Should have balloon on runs column', async () => {
        await checkColumnBalloon(page, 1, 5);
    });

    it('Should have correct status color in the overview page', async () => {
        const expectedColors = {
            CmCvjNbg: ['RUNNING', 'success'],
            EIDO13i3D: ['ERROR', 'danger'],
            TDI59So3d: ['DONE', 'black'],
        };

        for (const [environmentId, [status, colorClass]] of Object.entries(expectedColors)) {
            await expectInnerText(page, `#row${environmentId}-currentStatus`, status);
            await page.waitForSelector(`#row${environmentId}-currentStatus span.${colorClass}`);
        }
    });

    it('Should display the message of the current status below it', async () => {
        await expectInnerText(page, '#rowEIDO13i3D-statusMessage', 'This one is really broken');
    });

    it('Should display the total and running times of the status history, and its statuses on one line', async () => {
        // TDI59So3d: configured, running during one hour, deployed then done
        await expectInnerText(page, '#rowTDI59So3d-statusChain', 'C\n\u203A\nR\n\u203A\nD\n\u203A\nX');
        await expectInnerText(page, '#rowTDI59So3d-statusSummary', 'Total 02:55:00\nRunning 01:00:00');
    });

    it('Should display the configuration of the environment', async () => {
        await expectInnerText(page, '#rowCmCvjNbg-runType', 'PHYSICS');
        await expectInnerText(page, '#rowCmCvjNbg-beamType', 'pp');
        await expectInnerText(page, '#rowCmCvjNbg-detectors', 'FT0, ITS');
        await expectInnerText(page, '#rowCmCvjNbg-flps', '2');
        await expectInnerText(page, '#rowCmCvjNbg-epns', '2');
    });

    it('can set how many environments are available per page', async () => {
        // Expect the amount selector to currently be set to 7 (because of the defined page height)
        const amountSelectorId = '#amountSelector';
        const amountSelectorButton = await page.waitForSelector(`${amountSelectorId} button`);
        const amountSelectorButtonText = await page.evaluate((element) => element.innerText, amountSelectorButton);
        expect(amountSelectorButtonText.trim().endsWith('7')).to.be.true;

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
        // The page selector of phones (screens narrower than 768px) only displays the three page buttons nearest to the current one
        const viewport = page.viewport();
        await page.setViewport({ ...viewport, width: 800 });
        try {
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

            await page.evaluate(() => {
                // eslint-disable-next-line no-undef
                model.envs.overviewModel.pagination.reset();
                // eslint-disable-next-line no-undef
                model.envs.overviewModel.pagination.notify();
            });
        } finally {
            await page.setViewport(viewport);
        }    });

    it('should successfully display the list of related runs as hyperlinks to their details page', async () => {
        await waitForNavigation(page, () => pressElement(page, 'a#env-overview', true));
        await waitForNavigation(page, () => pressElement(page, '#rowTDI59So3d-runs a', true));
        expectUrlParams(page, { page: 'run-detail', runNumber: 103 });
    });

    it('should successfully display dropdown links', async () => {
        await waitForNavigation(page, () => pressElement(page, 'a#env-overview', true));

        // Running env
        let envId = 'CmCvjNbg';
        await pressElement(page, `tr[id='row${envId}'] .popover-trigger`, true);
        let popover = await getPopoverSelector(await page.waitForSelector(`tr[id='row${envId}'] .popover-trigger`));

        await expectLink(page, `${popover} :nth-child(1 of .external-link)`, {
            href: 'http://localhost:8081/?q={%22partition%22:{%22match%22:%22CmCvjNbg%22},%22severity%22:{%22in%22:%22W%20E%20F%22}}',
            innerText: 'Infologger FLP',
        });

        await expectLink(page, `${popover} :nth-child(2 of .external-link)`, {
            href: 'http://localhost:8080/?page=environment&id=CmCvjNbg',
            innerText: 'ECS',
        });

        await expectLink(page, `${popover} #add-log-link`, {
            href: 'http://localhost:4000/?page=log-create&environmentIds=CmCvjNbg',
            innerText: 'Add log',
        });

        // Not running env
        envId = 'EIDO13i3D';
        // The popover of the previous environment is still opened: with a real mouse click, depending on the layout, the click could land on
        // one of its links (opening an external page in a new tab, which stops the page from rendering and hangs the next tests)
        await pressElement(page, `tr[id='row${envId}'] .popover-trigger`, true);
        popover = await getPopoverSelector(await page.waitForSelector(`tr[id='row${envId}'] .popover-trigger`));

        await expectLink(page, `${popover} :nth-child(1 of .external-link)`, {
            href: 'http://localhost:8081/?q={%22partition%22:{%22match%22:%22EIDO13i3D%22},%22severity%22:{%22in%22:%22W%20E%20F%22}}',
            innerText: 'Infologger FLP',
        });

        // ECS link should not be present
        await page.waitForSelector(`${popover} :nth-child(2 of .external-link)`, { hidden: true });

        await expectLink(page, `${popover} #add-log-link`, {
            href: 'http://localhost:4000/?page=log-create&environmentIds=EIDO13i3D&runNumbers=94,95,96',
            innerText: 'Add log',
        });
    });

    it('should skip load when infinite scroll is enabled but call it when disabled', async () => {
        // Set up spy on the overviewModel.load method
        await page.evaluate(() => {
            const originalLoad = model.envs.overviewModel.load.bind(model.envs.overviewModel);
            model.envs.overviewModel.load = function(...args) {
                model.envs.overviewModel._loadCallCount++;
                return originalLoad(...args);
            };
        });

        await page.evaluate(() => {
            model.envs.overviewModel._loadCallCount = 0;
            model.envs.loadOverview();
        });

        // load() should have been called once
        let loadCallCount = await page.evaluate(() => {
            return model.envs.overviewModel._loadCallCount;
        });
        expect(loadCallCount).to.equal(1);

        // Enable infinite scroll mode
        await page.evaluate(() => {
            model.envs.overviewModel.pagination.enableInfiniteMode();
        });

        // Reset counter and test again
        await page.evaluate(() => {
            model.envs.overviewModel._loadCallCount = 0;
            model.envs.loadOverview();
        });

        // load() should not have been called
        loadCallCount = await page.evaluate(() => {
            return model.envs.overviewModel._loadCallCount;
        });
        expect(loadCallCount).to.equal(0);
    });

    it('should successfully filter environments utilising all filters in the process', async () => {
        // Get the popover key from the filter button's parent
        const filterButton = await page.waitForSelector('#openFilterToggle');
        const popoverKey = await filterButton.evaluate((button) => {
            return button.parentElement.getAttribute('data-popover-key');
        });
        const filterPanelSelector = `.popover[data-popover-key="${popoverKey}"]`;
        
        await page.waitForSelector(filterPanelSelector, { hidden: true });
        
        await openFilteringPanel(page);
        await page.waitForSelector(filterPanelSelector, { visible: true });

        await expectAttributeValue(page, '.id-filter input', 'placeholder', 'e.g. CmCvjNbg, TDI59So3d...');
        await expectAttributeValue(page, '.runs-filter input', 'placeholder', 'e.g. 553203, 553221, ...');
        await expectAttributeValue(page, '.historyItems-filter input', 'placeholder', 'e.g. D-R-X');

        // range of runNumbers
        await fillInput(page, '.runs-filter input', '103-104', ['change']);
        await waitForTableLength(page, 1);
        // substring of a runNumber
        await fillInput(page, '.runs-filter input', '10', ['change']);

        await fillInput(page, '.id-filter input', 'Dxi029djX, TDI59So3d', ['change']);
        await page.$eval('.status-filter #checkboxes-checkbox-DONE', (element) => element.click());

        await fillInput(page, '.historyItems-filter input', 'C-R-D-X', ['change']);
        
        const createdAtPopoverSelector = await getPopoverSelector(await page.$('.createdAt-filter .popover-trigger'));
        const {fromDateTimeSelector, toDateTimeSelector} = getPeriodInputsSelectors(createdAtPopoverSelector);
        await fillInput(page, fromDateTimeSelector, '2019-08-09T00:00', ['change']);
        await fillInput(page, toDateTimeSelector, '2019-08-10T23:59', ['change']);

        await waitForTableLength(page, 1);
        expect(await page.$$eval('tbody tr', (rows) => rows.map((row) => row.id))).to.eql(['rowTDI59So3d']);

        await resetFilters(page);
    });
};
