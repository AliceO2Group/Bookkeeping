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
    pressElement,
    goToPage,
    validateTableData,
    expectUrlParams,
    waitForNavigation,
    getColumnCellsInnerTexts,
    getPopoverContent,
} = require('../defaults.js');

const { expect } = chai;
const dateAndTime = require('date-and-time');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');

module.exports = () => {
    let page;
    let browser;

    before(async () => {
        [page, browser] = await defaultBefore(page, browser);
        await page.setViewport({
            width: 1200,
            height: 720,
            deviceScaleFactor: 1,
        });
        await resetDatabaseContent();
    });

    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('loads the page successfully', async () => {
        const response = await goToPage(page, 'synchronous-qc-flags', { queryParameters: { runNumber: 56, dplDetectorId: 7 } });

        expect(response.status()).to.equal(200);
        expect(await page.title()).to.equal('AliceO2 Bookkeeping');

        await expectInnerText(page, '#breadcrumb-header', 'Sync QC');
        await expectInnerText(page, '#breadcrumb-run-number', '56');
        await expectInnerText(page, '#breadcrumb-detector-name', 'FT0');
    });

    it('shows correct datatypes in respective columns', async () => {
        // eslint-disable-next-line require-jsdoc
        const validateDate = (date) => date === '-' || !isNaN(dateAndTime.parse(date, 'DD/MM/YYYY, hh:mm:ss'));
        const tableDataValidators = {
            flagType: (flagType) => flagType && flagType !== '-',
            from: (cellContent) => {
                const match = cellContent.match(/^From:\s*(.+)\nTo:\s*(.+)$/);
                if (!match) return false;
                const [, from, to] = match;
                return (['Whole run coverage', 'Since run start'].includes(from) || validateDate(from))
                    && (['Whole run coverage', 'Until run end'].includes(to) || validateDate(to));
            },
            deleted: (value) => value === 'Yes' || value === 'No',
            createdBy: (cellContent) => {
                const match = cellContent.match(/^By:\s*(.+)\nAt:\s*(.+)$/);
                return match && match[1] !== '-' && validateDate(match[2]);
            },
        };

        await validateTableData(page, new Map(Object.entries(tableDataValidators)));

        expect(await getColumnCellsInnerTexts(page, 'flagType'), ['Bad PID', 'Good']);
    });

    it('Should display the correct items counter at the bottom of the page', async () => {
        await expectInnerText(page, '#firstRowIndex', '1');
        await expectInnerText(page, '#lastRowIndex', '2');
        await expectInnerText(page, '#totalRowsCount', '2');
    });

    it('should display Comment tooltip with full information', async () => {
        let popoverTrigger = await page.$(`#row100-comment .popover-trigger`);
        expect(popoverTrigger).to.not.be.null;

        const popoverContent = await getPopoverContent(popoverTrigger);
        expect(popoverContent).to.equal('first part good');
    });

    it('should display CreatedBy tooltip with full information', async () => {
        let popoverTrigger = await page.$(`#row100-createdBy .popover-trigger`);
        expect(popoverTrigger).to.not.be.null;

        const popoverContent = await getPopoverContent(popoverTrigger);
        expect(popoverContent).to.equal('By: Jan JansenAt: 12/08/2024, 12:00:00');
    });

    it('should display correct Deleted text colour', async () => {
        const deletedCell = await page.$('#row100-deleted-text:nth-child(1)');

        const deletedCellText = await page.evaluate(cell => cell.textContent.trim(), deletedCell);
        expect(deletedCellText).to.equal('Yes');

        const deletedCellFirstChildClass = await page.evaluate(cell => cell.firstElementChild.className, deletedCell);
        expect(deletedCellFirstChildClass).to.include('danger');
    });

    it('can navigate to run details page from breadcrumbs link', async () => {
        await waitForNavigation(page, () => pressElement(page, '#breadcrumb-run-number'));
        expectUrlParams(page, { page: 'run-detail', runNumber: '56' });
    });
};
