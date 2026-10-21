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

const { expect } = require('chai');
const {
    defaultBefore,
    defaultAfter,
    goToPage,
    pressElement,
    waitForNavigation,
    expectUrlParams,
    expectInnerText,
} = require('../defaults.js');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');
const { ShiftTypes } = require('../../../lib/domain/enums/ShiftTypes.js');

/**
 * Expected header height, which must not depend on the screen size
 */
const NAVBAR_HEIGHT = 48;

const VIEWPORTS = {
    phone: { width: 375, height: 812 },
    tablet: { width: 820, height: 1180 },
    laptop: { width: 1280, height: 800 },
    desktop: { width: 1920, height: 1080 },
};

module.exports = () => {
    let page;
    let browser;

    /**
     * Resize the browser and reload the home page so that the layout is computed for the new size
     *
     * @param {{width: number, height: number}} viewport the new viewport size
     * @return {Promise<void>} resolves once the page is loaded
     */
    const openHomeWithViewport = async (viewport) => {
        await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
        await goToPage(page, 'home');
        await page.waitForSelector('#navbar');
    };

    /**
     * Returns true if the first element matching the selector is rendered (not hidden with display none)
     *
     * @param {string} selector the css selector
     * @return {Promise<boolean>} true if displayed
     */
    const isDisplayed = (selector) => page.$eval(selector, (element) => window.getComputedStyle(element).display !== 'none');

    /**
     * Returns the inner texts of the entries of the currently opened navbar dropdown
     *
     * @param {string} selector the selector of the dropdown entries
     * @return {Promise<string[]>} the entries texts
     */
    const getEntriesTexts = (selector) => page.$$eval(selector, (elements) => elements.map(({ innerText }) => innerText.trim()));

    before(async () => {
        [page, browser] = await defaultBefore(page, browser);
        await resetDatabaseContent();
    });

    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    describe('Full navigation bar (laptop and bigger screens)', () => {
        for (const size of ['laptop', 'desktop']) {
            it(`should display the page tabs and no menu button on a ${size} screen`, async () => {
                await openHomeWithViewport(VIEWPORTS[size]);

                expect(await isDisplayed('.navbar-links')).to.be.true;
                expect(await isDisplayed('#navbar-menu-toggle')).to.be.false;
                await expectInnerText(page, '#navbar-title', 'Bookkeeping');
            });

            it(`should keep the page tabs on one line, without overflowing, on a ${size} screen`, async () => {
                await openHomeWithViewport(VIEWPORTS[size]);

                const { height, hasHorizontalOverflow } = await page.evaluate(() => ({
                    height: document.querySelector('#navbar').getBoundingClientRect().height,
                    hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
                }));
                expect(height).to.equal(NAVBAR_HEIGHT);
                expect(hasHorizontalOverflow).to.be.false;
            });
        }
    });

    describe('Collapsed navigation bar (tablet and phone screens)', () => {
        for (const size of ['tablet', 'phone']) {
            it(`should replace the page tabs by a menu button on a ${size} screen`, async () => {
                await openHomeWithViewport(VIEWPORTS[size]);

                expect(await isDisplayed('.navbar-links')).to.be.false;
                expect(await isDisplayed('#navbar-menu-toggle')).to.be.true;
            });

            it(`should keep the same header height as on bigger screens on a ${size} screen`, async () => {
                await openHomeWithViewport(VIEWPORTS[size]);

                const height = await page.$eval('#navbar', (element) => element.getBoundingClientRect().height);
                expect(height).to.equal(NAVBAR_HEIGHT);
            });

            it(`should always display the Bookkeeping title on a ${size} screen`, async () => {
                await openHomeWithViewport(VIEWPORTS[size]);

                expect(await isDisplayed('#navbar-title')).to.be.true;
                await expectInnerText(page, '#navbar-title', 'Bookkeeping');
            });
        }

        it('should list all the pages in the menu when pressing the menu button', async () => {
            await openHomeWithViewport(VIEWPORTS.tablet);

            await pressElement(page, '#navbar-menu-toggle');
            await page.waitForSelector('.navbar-menu');

            const entries = await getEntriesTexts('.navbar-menu .menu-item');
            for (const expectedEntry of ['Home', 'Log Entries', 'Environments', 'LHC Fills', 'Runs', 'RCT', 'Statistics', 'Tag Overview', 'QC Flag Types', 'About']) {
                expect(entries).to.include(expectedEntry);
            }
        });

        it('should navigate to the chosen page and close the menu', async () => {
            await openHomeWithViewport(VIEWPORTS.tablet);

            await pressElement(page, '#navbar-menu-toggle');
            await page.waitForSelector('.navbar-menu');
            await waitForNavigation(page, () => page.evaluate(() => {
                [...document.querySelectorAll('.navbar-menu .menu-item')].find(({ innerText }) => innerText.trim() === 'Runs').click();
            }));

            expectUrlParams(page, { page: 'run-overview' });
            await page.waitForSelector('.navbar-menu', { hidden: true });
        });

        it('should highlight the current page in the menu', async () => {
            await page.setViewport({ ...VIEWPORTS.tablet, deviceScaleFactor: 1 });
            await goToPage(page, 'run-overview');
            await pressElement(page, '#navbar-menu-toggle');
            await page.waitForSelector('.navbar-menu');

            expect(await getEntriesTexts('.navbar-menu .menu-item.selected')).to.eql(['Runs']);
        });

        it('should close the menu when clicking outside of it', async () => {
            await openHomeWithViewport(VIEWPORTS.tablet);

            await pressElement(page, '#navbar-menu-toggle');
            await page.waitForSelector('.navbar-menu');
            await pressElement(page, '#global-container', true);

            await page.waitForSelector('.navbar-menu', { hidden: true });
        });

        it('should close the menu when pressing Escape', async () => {
            await openHomeWithViewport(VIEWPORTS.tablet);

            await pressElement(page, '#navbar-menu-toggle');
            await page.waitForSelector('.navbar-menu');
            await page.keyboard.press('Escape');

            await page.waitForSelector('.navbar-menu', { hidden: true });
        });
    });

    describe('Create menu', () => {
        it('should display the full label of the create button on bigger screens', async () => {
            await openHomeWithViewport(VIEWPORTS.laptop);

            expect(await isDisplayed('.navbar-create-label')).to.be.true;
            await expectInnerText(page, '#create-menu-button', 'Add an entry');
        });

        it('should shrink the create button to a plus on a phone screen', async () => {
            await openHomeWithViewport(VIEWPORTS.phone);

            expect(await isDisplayed('#create-menu-button')).to.be.true;
            expect(await isDisplayed('.navbar-create-label')).to.be.false;
        });

        it('should list the log types and the EoS report shift types', async () => {
            await openHomeWithViewport(VIEWPORTS.laptop);

            await pressElement(page, '#create-menu-button');
            await page.waitForSelector('.navbar-dropdown.dropdown-open .menu-item');

            const entries = await getEntriesTexts('.navbar-dropdown.dropdown-open .menu-item');
            expect(entries).to.eql(['Log entry', 'On-call log', 'RC daily meeting log', ...Object.values(ShiftTypes)]);
            // The EoS report heading is not a link
            expect(await getEntriesTexts('.navbar-dropdown.dropdown-open .menu-title')).to.eql(['EoS report'.toUpperCase()]);
        });

        it('should not highlight any entry of the create menu', async () => {
            await page.setViewport({ ...VIEWPORTS.laptop, deviceScaleFactor: 1 });
            await goToPage(page, 'log-create');

            await pressElement(page, '#create-menu-button');
            await page.waitForSelector('.navbar-dropdown.dropdown-open .menu-item');

            expect(await getEntriesTexts('.navbar-dropdown.dropdown-open .menu-item.selected')).to.eql([]);
        });

        it('should open the on-call log template', async () => {
            await openHomeWithViewport(VIEWPORTS.laptop);

            await pressElement(page, '#create-menu-button');
            await page.waitForSelector('.navbar-dropdown.dropdown-open .menu-item');
            await waitForNavigation(page, () => page.evaluate(() => {
                [...document.querySelectorAll('.navbar-dropdown.dropdown-open .menu-item')]
                    .find(({ innerText }) => innerText.trim() === 'On-call log').click();
            }));

            expectUrlParams(page, { page: 'log-create', templateKey: 'on-call' });
        });

        it('should open the EoS report creation page of the chosen shift type', async () => {
            await openHomeWithViewport(VIEWPORTS.laptop);

            await pressElement(page, '#create-menu-button');
            await page.waitForSelector('.navbar-dropdown.dropdown-open .menu-item');
            await waitForNavigation(page, () => page.evaluate((shiftType) => {
                [...document.querySelectorAll('.navbar-dropdown.dropdown-open .menu-item')]
                    .find(({ innerText }) => innerText.trim() === shiftType).click();
            }, ShiftTypes.SL));

            expectUrlParams(page, { page: 'eos-report-create', shiftType: ShiftTypes.SL });
        });

        it('should redirect to the home page when opening the EoS report creation page without shift type', async () => {
            await page.setViewport({ ...VIEWPORTS.laptop, deviceScaleFactor: 1 });
            await goToPage(page, 'eos-report-create');

            await page.waitForFunction(() => new URL(window.location.href).searchParams.get('page') === 'home');
        });
    });

    describe('Account menu', () => {
        it('should open the account menu on the left of the header and keep it inside of the screen', async () => {
            await openHomeWithViewport(VIEWPORTS.phone);

            await pressElement(page, '[title="User Actions"] button');
            await page.waitForSelector('[title="User Actions"].dropdown-open .dropdown-menu');

            const { left, right } = await page.$eval(
                '[title="User Actions"] .dropdown-menu',
                (element) => element.getBoundingClientRect().toJSON(),
            );
            expect(left).to.be.at.least(0);
            expect(right).to.be.at.most(VIEWPORTS.phone.width);
        });
    });
};
