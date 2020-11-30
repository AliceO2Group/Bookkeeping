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
const {defaultBefore, defaultAfter, expectInnerText, pressElement} = require('../defaults');

const {expect} = chai;

module.exports = () => {
    let page;
    let browser;
    let url;

    let table;
    let firstRowId;

    before(async () => {
        [page, browser, url] = await defaultBefore(page, browser);
    });
    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('run export loads correctly', async () => {
        console.log("hallo")
        await page.goto(`${url}/?page=run-export`, {waitUntil: 'networkidle0'});

        // We expect the log creation screen to be shown correctly
        const header = await page.$('h2');
        expect(Boolean(header)).to.be.true;
        const headerText = await page.evaluate((element) => element.innerText, header);
        expect(headerText).to.equal('Export Runs');
    });

    it('can create a export with a run number and fields', async () => {
        const title = 'Single run number test';
        const text = 'Sample Text';
        const runNumbersStr = '1';
        const runsFields = ['id', 'runNumber'];
        const test = []

        // Send the value of the run numbers string to the input
        await page.type('#run-number', runNumbersStr);

        // Find the selection options corresponding to runs fields
        // const optionsToSelect = ['1', '2'];
        // const tagOptions = await page.$$('runs-fields-option');
        // for (const _option of tagOptions) {
        //     const option = await _option;
        //     const optionText = await page.evaluate((element) => element.innerText, option);
        //     optionsToSelect.push(optionText);
        // }
        const optionsToSelect = [];
        const runsFieldsOptions = await page.$$('runs-fields-option');
        for (const _option of runsFieldsOptions) {
            const option = await _option;
            const optionText = await page.evaluate((element) => element.innerText, option);
            console.log("optionText", optionText)
            console.log("runsfields", typeof test)
            console.log("Does runfields include option text", runsfields.includes(optionText))
            if (runsfields.includes(optionText)) {
                console.log("TEST")
                const optionValue = await page.evaluate((element) => element.value, option);
                console.log("optionText", optionText)
                console.log("optionValue", optionValue)
                optionsToSelect.push(optionValue);
            }
        }

        // Select the collection of runs fields
        await page.select('select#fields', ...optionsToSelect);
        //
        // Expect to have selected two options
        const runsFieldsSelection = await page.$('select#fields');
        console.log("runsFieldsSelection", runsFieldsSelection)
        const runsFieldsSelectedOptions = await page.evaluate((element) => element.selectedOptions, runsFieldsSelection);
        console.log("runsFieldsSelectedOptions", runsFieldsSelectedOptions)
        console.log("test 1", Object.keys(runsFieldsSelectedOptions).length)
        console.log("test 2", runsFieldsSelectedOptions.length)
        expect(Object.keys(tagSelectedOptions).length).to.equal(13);
        //
        // // Create the new export
        // const buttonSend = await page.$('button#send');
        // await buttonSend.evaluate((button) => button.click());
        // await page.waitForTimeout(250);
    });
};
