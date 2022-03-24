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
const { defaultBefore, defaultAfter, expectInnerText, goToPage } = require('../defaults');

const { expect } = chai;

module.exports = () => {
    let page;
    let browser;
    let url;

    before(async () => {
        [page, browser, url] = await defaultBefore(page, browser);
        await page.setViewport({ width: 1920, height: 1080 });
    });
    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('run export loads correctly', async () => {
        await page.goto(`${url}/?page=run-export`, { waitUntil: 'networkidle0' });

        // We expect the log creation screen to be shown correctly
        const header = await page.$('h2');
        expect(Boolean(header)).to.be.true;
        const headerText = await page.evaluate((element) => element.innerText, header);
        expect(headerText).to.equal('Export Runs');
    });

    it('can create a export with a run number and fields', async () => {
        const runNumbersStr = '1';
        const runsFields = ['runNumber'];

        // Send the value of the run numbers string to the input
        await page.type('#run-number', runNumbersStr);

        const optionsToSelect = [];
        const runsFieldsOptions = await page.$$('runs-fields-option');
        for (const _option of runsFieldsOptions) {
            const option = await _option;
            const optionText = await page.evaluate((element) => element.innerText, option);
            if (runsFields.includes(optionText)) {
                const optionValue = await page.evaluate((element) => element.value, option);
                optionsToSelect.push(optionValue);
            }
        }

        // Select the collection of runs fields
        await page.select('select#fields', ...optionsToSelect);

        /*
         *
         * Expect to have selected two options
         */

        /*
         * Const runsFieldsSelection = await page.$('select#fields');
         * const runsFieldsSelectedOptions =
         *     await page.evaluate((element) => element.selectedOptions, runsFieldsSelection);
         * expect(Object.keys(runsFieldsSelectedOptions).length).to.equal(14);
         */
    });

    it('shows error on incorrect run number', async () => {
        await goToPage(page, 'run-export');
        const runNumbersStr = '99999999';

        // Send the value of the run numbers string to the input and select the id field
        await page.type('#run-number', runNumbersStr);
        await page.select('select#fields', 'runNumber');
        await page.click('#send');

        // We expect there to be an error message
        const expectedMessage = 'No data found: No valid runs were found for provided run number(s)';
        await expectInnerText(page, '.alert-danger', expectedMessage);
    });
};
