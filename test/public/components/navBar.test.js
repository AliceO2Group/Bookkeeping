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

const {
    defaultBefore,
    defaultAfter,
    goToPage,
    expectUrlParams,
} = require('../defaults.js');

module.exports = () => {
    let page;
    let browser;
    const navTabSelector = 'a.btn-tab[id]'; // ALI FLP doesn't have an id, nor a functional href, hence why it is excluded like this

    before(async () => {
        [page, browser] = await defaultBefore();
    });

    it('NavBar Tabs should navigate to their respective pages', async () => {
        await goToPage(page, 'home');
        
        await page.waitForSelector(navTabSelector);

        const tabIds = await page.$$eval(navTabSelector, tabs => tabs.map(tab => tab.id));
        
        for (const id of tabIds) {
            await page.click(`#${id}`);
            
            expectUrlParams(page, { page: id }); // basePageTabs set their links and their ID to be the same.
            await goToPage(page, 'home'); // Additional check to see if the correct
        }
    });

    after(async () => {
        await defaultAfter(page, browser);
    });
};
