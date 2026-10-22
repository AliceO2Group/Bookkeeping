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
    expectUrlParams,
    goToPage,
    pressElement,
    waitForNavigation,
    expectLink,
    waitForTableLength,
} = require('../defaults.js');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');

const { expect } = chai;

/**
 * Navigate directly to the details page of the given environment and wait for it to be rendered
 *
 * Each test that needs a specific environment loads it itself, so that a failure in one test does not cascade to the next ones
 *
 * @param {puppeteer.Page} page the puppeteer page
 * @param {string} environmentId the id of the environment to display
 * @return {Promise<void>} resolves once the environment details are displayed
 */
const goToEnvironmentDetails = async (page, environmentId) => {
    await goToPage(page, 'env-details', { queryParameters: { environmentId } });
    await expectInnerText(page, 'h2', `Environment ${environmentId}`);
};

module.exports = () => {
    let page;
    let browser;

    before(async () => {
        [page, browser] = await defaultBefore(page, browser);
        await page.setViewport({
            width: 800,
            height: 1080,
            deviceScaleFactor: 1,
        });
        await resetDatabaseContent();
    });

    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('Should successfully load environment\'s details page', async () => {
        await goToEnvironmentDetails(page, 'TDI59So3d');
    });

    it('Should successfully display the current environment\'s status', async () => {
        await expectInnerText(page, '#environment-status-badge.badge', 'DONE');
    });

    it('Should successfully display the creation date of the environment', async () => {
        await expectInnerText(page, '#environment-creation-date', 'Created at 09/08/2019, 16:05:00');
    });

    it('Should successfully display the history of the environment', async () => {
        await page.waitForFunction(() => document.querySelectorAll('.history-item').length === 4);
        const historyStatuses = await page.$$eval('.history-item .badge', (badges) => badges.map((badge) => badge.innerText));
        expect(historyStatuses).to.eql(['CONFIGURED', 'RUNNING', 'DEPLOYED', 'DONE']);
    });

    it('Should successfully display the runs related to the environment', async () => {
        await page.waitForFunction(() => document.querySelectorAll('#runs-pane tbody tr').length === 3);
        const runNumbers = await page.$$eval('#runs-pane tbody tr td:first-of-type', (cells) => cells.map((cell) => cell.innerText));
        expect(runNumbers).to.eql(['103', '104', '105']);
    });

    it('should successfully expose a button to create a new log related to the displayed environment', async () => {
        await waitForNavigation(page, () => pressElement(page, '#create-log'));
        expectUrlParams(page, { page: 'log-create', environmentIds: 'TDI59So3d', runNumbers: '103,104,105' });

        await page.waitForFunction(() => document.querySelector('input#environments')?.value === 'TDI59So3d');
    });

    it('should successfully navigate from the environments overview to an environment\'s details page', async () => {
        await goToPage(page, 'env-overview');

        /*
         * The overview table can be re-rendered (loading state then new rows) between the moment the row is found and the moment it is
         * clicked, so use a JS click that finds and clicks the link in one go
         */
        await waitForNavigation(page, () => pressElement(page, '#row8E4aZTjY a:first-of-type', true));
        expectUrlParams(page, { page: 'env-details', environmentId: '8E4aZTjY' });
        await expectInnerText(page, 'h2', 'Environment 8E4aZTjY');
    });

    it('should successfully provide a tab to display related logs', async () => {
        await goToEnvironmentDetails(page, '8E4aZTjY');
        await pressElement(page, '#logs-tab');

        await waitForTableLength(page, 3);
        const rowIds = await page.$$eval('#logs-pane table tbody tr', (rows) => rows.map((row) => row.id));
        expect(rowIds).to.eql(['row1', 'row3', 'row4']);
    });

    it('should successfully display a message when environment has no raw configuration', async () => {
        await goToEnvironmentDetails(page, '8E4aZTjY');
        await pressElement(page, '#raw-configuration-tab');

        await expectInnerText(
            page,
            '#raw-configuration-pane',
            'No raw configuration stored for this environment. It might have been stored in one of the logs',
        );
    });

    it('should successfully provide a tab to display environment configuration', async () => {
        await goToEnvironmentDetails(page, 'Dxi029djX');
        await pressElement(page, '#raw-configuration-tab');

        await expectInnerText(page, '#raw-configuration-pane table #rowccdb_enabled-key-text', 'ccdb_enabled');
        await expectInnerText(page, '#raw-configuration-pane table #rowccdb_enabled-value-text', 'true');
        await expectInnerText(page, '#raw-configuration-pane table #rowdcs_enabled-key-text', 'dcs_enabled');
        await expectInnerText(page, '#raw-configuration-pane table #rowdcs_enabled-value-text', 'false');
    });

    it('should successfully display environment configuration sorted by key', async () => {
        await goToEnvironmentDetails(page, 'CmCvjNbg');
        await pressElement(page, '#raw-configuration-tab');

        await waitForTableLength(page, 20);
        const keys = await page.$$eval('#raw-configuration-pane table tbody tr td:first-child', (cells) => cells.map((cell) => cell.innerText));
        expect(keys).to.eql([...keys].sort((keyA, keyB) => keyA.localeCompare(keyB)));
    });

    it('should successfully display FLP and ECS links', async () => {
        await goToEnvironmentDetails(page, 'CmCvjNbg');
        const containerSelector = 'h3.flex-row.w-100.g2.items-baseline.mb3';

        await expectLink(page, `${containerSelector} a:nth-of-type(1)`, {
            href:
                'http://localhost:8081/?q={%22partition%22:{%22match%22:%22CmCvjNbg%22},%22severity%22:{%22in%22:%22W%20E%20F%22}}',
            innerText: 'FLP',
        });
        await expectLink(page, `${containerSelector} a:nth-of-type(2)`, {
            href: 'http://localhost:8080/?page=environment&id=CmCvjNbg',
            innerText: 'ECS',
        });
    });
};
