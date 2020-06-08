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
const puppeteer = require('puppeteer');
const pti = require('puppeteer-to-istanbul');
const { server } = require('../../../lib/application');

const { expect } = chai;

module.exports = () => {
    let page;
    let browser;
    let url;

    before(async () => {
        browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        page = await browser.newPage();
        await Promise.all([
            page.coverage.startJSCoverage({ resetOnNavigation: false }),
            page.coverage.startCSSCoverage(),
        ]);

        const { port } = server.address();
        url = `http://localhost:${port}`;
    });

    after(async () => {
        const [jsCoverage, cssCoverage] = await Promise.all([
            page.coverage.stopJSCoverage(),
            page.coverage.stopCSSCoverage(),
        ]);

        pti.write([...jsCoverage, ...cssCoverage].filter(({ url = '' } = {}) => url.match(/\.(js|css)$/)), {
            includeHostname: false,
            storagePath: './.nyc_output/lib/public',
        });
        await browser.close();
    });

    it('log detail loads correctly', async () => {
        await page.goto(`${url}/?page=entry&id=1`);
        await page.waitFor(100);

        // We expect there to be at least one post in this log entry
        const postExists = await page.$('#post1');
        expect(Boolean(postExists)).to.be.true;
    });

    it('notifies if a specified log id is invalid', async () => {
        // Navigate to a log detail view with an id that cannot exist
        await page.goto(`${url}/?page=entry&id=99999999`);
        await page.waitFor(100);

        // We expect there to be an error message
        const error = await page.$('.alert-danger');
        expect(Boolean(error)).to.be.true;
        const message = await page.evaluate((element) => element.innerText, error);
        expect(message).to.equal('Log with this id (99999999) could not be found:');
    });

    it('should have a button to reply on a entry', async () => {
        const parentLogId = 2;
        await page.goto(`${url}/?page=entry&id=${parentLogId}`);
        await page.waitFor(250);

        // We expect there to be at least one post in this log entry
        await page.click(`#reply-to-${parentLogId}`);
        await page.waitFor(1000);

        const redirectedUrl = await page.url();
        expect(redirectedUrl).to.equal(`${url}/?page=create-log-entry&parentLogId=${parentLogId}`);

        const title = 'Test the reply button';
        const text = 'Test the reply button';

        await page.type('#title', title);
        // eslint-disable-next-line no-undef
        await page.evaluate((text) => model.logs.editor.setValue(text), text);
        await page.waitFor(250);

        // Create the new log
        const button = await page.$('button#send');
        await button.evaluate((button) => button.click());
        await page.waitFor(1000);

        const postSendUrl = await page.url();
        expect(postSendUrl).to.equal(`${url}/?page=entry&id=10`);
    });
};
