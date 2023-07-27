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
const { defaultBefore, defaultAfter, pressElement, getFirstRow, goToPage } = require('../defaults');

const { expect } = chai;

module.exports = () => {
    let page;
    let browser;

    let table;
    let firstRowId;

    before(async () => {
        [page, browser] = await defaultBefore(page, browser);
        await page.setViewport({
            width: 700,
            height: 720,
            deviceScaleFactor: 1,
        });
    });

    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('loads the page successfully', async () => {
        const response = await goToPage(page, 'about-overview');

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');
    });

    it('Can find a panel for each service', async () => {
        const services = ['Bookkeeping', 'Database']

        // For each service, search for an element with that id 
        for (const service of services) {
            const servicePanel = await page.$(`#${service}`)
            expect(servicePanel, `Couldn't find panel for service ${service}`).to.not.be.null;
        }
    });
};
