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
const { defaultBefore, defaultAfter, expectInnerText } = require('../defaults');
const { goToPage } = require('../defaults.js');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');

const { expect } = chai;

module.exports = () => {
    let page;
    let browser;

    before(async () => {
        [page, browser] = await defaultBefore(page, browser);
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

    it('Should successfully load environment\'s details page', async () => {
        await goToPage(page, 'env-details', { queryParameters: { environmentId: 'TDI59So3d' } });
        await expectInnerText(page, 'h2', 'Environment TDI59So3d');
    });

    it('Should successfully display the current environment\'s status', async () => {
        const statusBadge = await page.$('#environment-status-badge');
        expect(statusBadge).not.be.null;
        expect(await statusBadge.evaluate((element) => element.classList.contains('badge'))).to.be.true;
        expect(await statusBadge.evaluate((element) => element.innerText)).to.equal('DESTROYED');
    });

    it('Should successfully display the creation date of the environment', async () => {
        await expectInnerText(page, '#environment-creation-date', 'Created at 09/08/2019, 00:00:00');
    });

    it('Should successfully display the history of the environment', async () => {
        const historyItems = await page.$$('.history-item');
        expect(historyItems).to.have.lengthOf(4);
        expect(await historyItems[0].$eval('.badge', (element) => element.innerText)).to.equal('CONFIGURED');
        expect(await historyItems[1].$eval('.badge', (element) => element.innerText)).to.equal('RUNNING');
        expect(await historyItems[2].$eval('.badge', (element) => element.innerText)).to.equal('STOPPED');
        expect(await historyItems[3].$eval('.badge', (element) => element.innerText)).to.equal('DESTROYED');
        expect(await historyItems[3].$eval('.badge', (element) => element.classList.contains('bg-primary'))).to.be.true;
    });

    it('Should successfully display the runs related to the environment', async () => {
        const runsRows = await page.$$('#runs tbody tr');
        expect(runsRows).to.have.lengthOf(3);
        expect(await runsRows[0].$eval('td:first-of-type', (element) => element.innerText)).to.equal('103');
        expect(await runsRows[1].$eval('td:first-of-type', (element) => element.innerText)).to.equal('104');
        expect(await runsRows[2].$eval('td:first-of-type', (element) => element.innerText)).to.equal('105');
    });
};
