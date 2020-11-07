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

const puppeteer = require('puppeteer');
const pti = require('puppeteer-to-istanbul');
const { server } = require('../../lib/application');

module.exports.defaultBefore = async (page, browser) => {
    browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    page = await browser.newPage();
    await Promise.all([
        page.coverage.startJSCoverage({ resetOnNavigation: false }),
        page.coverage.startCSSCoverage(),
    ]);

    const { port } = server.address();
    const url = `http://localhost:${port}`;

    return [page, browser, url];
};

module.exports.defaultAfter = async (page, browser) => {
    const [jsCoverage, cssCoverage] = await Promise.all([
        page.coverage.stopJSCoverage(),
        page.coverage.stopCSSCoverage(),
    ]);

    pti.write([...jsCoverage, ...cssCoverage].filter(({ url = '' } = {}) => url.match(/\.(js|css)$/)), {
        includeHostname: false,
        storagePath: './.nyc_output/lib/public',
    });
    await browser.close();

    return [page, browser];
};
