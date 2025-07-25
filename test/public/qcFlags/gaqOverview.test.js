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
    waitForNavigation,
    getTableContent,
    getPopoverInnerText,
    setConfirmationDialogToBeAccepted,
    unsetConfirmationDialogActions,
    waitForTableLength,
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
        const response = await goToPage(page, 'gaq-flags', { queryParameters: { dataPassId: 1, runNumber: 106 } });

        expect(response.status()).to.equal(200);

        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');

        await expectInnerText(page, '#breadcrumb-header', 'GAQ');
        await expectInnerText(page, '#breadcrumb-data-pass-name', 'LHC22b_apass1');
        await expectInnerText(page, '#breadcrumb-run-number', '106');
    });

    it('shows correct datatypes in respective columns', async () => {
        // eslint-disable-next-line require-jsdoc
        const validateDate = (date) => date === '-' || !isNaN(dateAndTime.parse(date, 'DD/MM/YYYY hh:mm:ss'));
        const tableDataValidators = {
            generalQuality: (generalQuality) => ['good', 'bad', 'MC.R', ''].includes(generalQuality),
            from: (timestamp) => timestamp === 'Whole run coverage' || validateDate(timestamp),
            to: (timestamp) => timestamp === 'Whole run coverage' || validateDate(timestamp),
        };

        await validateTableData(page, new Map(Object.entries(tableDataValidators)));

        await waitForTableLength(page, 3);
        expect(await getTableContent(page)).to.have.all.deep.ordered.members([
            [
                '',
                '08/08/2019\n22:43:20',
                '09/08/2019\n04:16:40',
                'Limited Acceptance MC Reproducible',
                '',
            ],
            [
                '',
                '09/08/2019\n05:40:00',
                '09/08/2019\n07:03:20',
                'Limited acceptance',
                '',
            ],
            [
                '',
                '09/08/2019\n08:26:40',
                '09/08/2019\n09:50:00',
                'Bad',
                '',
            ],
        ]);

        await waitForNavigation(page, () => pressElement(page, '#breadcrumb-data-pass-name a', true));
        await waitForNavigation(page, () => pressElement(page, '#row106-EMC a', true));
        await pressElement(page, '#flag-type-panel .popover-trigger', true);
        await pressElement(page, '#flag-type-dropdown-option-3', true);

        await page.waitForSelector('button#submit[disabled]', { hidden: true, timeout: 250 });
        await waitForNavigation(page, () => pressElement(page, 'button#submit', true));
        await waitForTableLength(page, 3);
        await waitForNavigation(page, () => pressElement(page, '#row106-globalAggregatedQuality a', true));

        await waitForTableLength(page, 7);
        expect(await getTableContent(page)).to.have.all.deep.ordered.members([
            [
                '',
                '08/08/2019\n13:00:00',
                '08/08/2019\n22:43:20',
                '',
                'Good',
            ],
            [
                'MC.R',
                '08/08/2019\n22:43:20',
                '09/08/2019\n04:16:40',
                'Limited Acceptance MC Reproducible',
                'Good',
            ],
            [
                '',
                '09/08/2019\n04:16:40',
                '09/08/2019\n05:40:00',
                '',
                'Good',
            ],
            [
                'bad',
                '09/08/2019\n05:40:00',
                '09/08/2019\n07:03:20',
                'Limited acceptance',
                'Good',
            ],
            [
                '',
                '09/08/2019\n07:03:20',
                '09/08/2019\n08:26:40',
                '',
                'Good',
            ],
            [
                'bad',
                '09/08/2019\n08:26:40',
                '09/08/2019\n09:50:00',
                'Bad',
                'Good',
            ],
            [
                '',
                '09/08/2019\n09:50:00',
                '09/08/2019\n14:00:00',
                '',
                'Good',
            ],
        ]);

        expect(await getPopoverInnerText(await page.waitForSelector('tbody tr:nth-of-type(1) td div:nth-child(1) div.popover-trigger')))
            .to.be.equal('No flag for some detector');

        expect(await getPopoverInnerText(await page.waitForSelector('tbody tr:nth-of-type(1) td div:nth-child(2) div.popover-trigger')))
            .to.be.equal('At least one flag is not verified');

        setConfirmationDialogToBeAccepted(page);

        // Verify QC flag of CPV detector
        expect(await getPopoverInnerText(await page.waitForSelector('tbody tr:nth-of-type(2) td:nth-of-type(4) .popover-trigger')))
            .to.be.equal('This flag is not verified');
        await waitForNavigation(page, () => pressElement(page, 'tbody tr:nth-of-type(2) td:nth-of-type(4) a', true));
        await pressElement(page, '#verify-qc-flag');
        await pressElement(page, '#submit', true);
        await waitForNavigation(page, () => pressElement(page, '#qc-flag-details-dataPass a', true));
        await waitForNavigation(page, () => pressElement(page, '#row106-globalAggregatedQuality a', true));
        await page.waitForSelector('tbody tr:nth-of-type(2) td:nth-of-type(4) .popover-trigger', { hidden: true });

        // Verify QC flag of EMC detector
        expect(await getPopoverInnerText(await page.waitForSelector('tbody tr:nth-of-type(2) td:nth-of-type(5) .popover-trigger')))
            .to.be.equal('This flag is not verified');
        await waitForNavigation(page, () => pressElement(page, 'tbody tr:nth-of-type(2) td:nth-of-type(5) a', true));
        await pressElement(page, '#verify-qc-flag');
        await pressElement(page, '#submit', true);
        await waitForNavigation(page, () => pressElement(page, '#qc-flag-details-dataPass a', true));
        await waitForNavigation(page, () => pressElement(page, '#row106-globalAggregatedQuality a', true));
        await page.waitForSelector('tbody tr:nth-of-type(2) td:nth-of-type(5) .popover-trigger', { hidden: true });

        await page.waitForSelector('tbody tr:nth-of-type(2) td:nth-of-type(1) .popover-trigger', { hidden: true });

        unsetConfirmationDialogActions(page);
    });

    it('set GAQ detectors', async () => {
        await pressElement(page, '#gaq-detectors-selection-trigger', true);
        await page.waitForSelector('#gaq-detectorsCheckbox2');
        expect(await page.evaluate(() => document.querySelector('#gaq-detectorsCheckbox2').checked)).to.be.true; // CPV
        expect(await page.evaluate(() => document.querySelector('#gaq-detectorsCheckbox4').checked)).to.be.true; // EMC

        await pressElement(page, '#gaq-detectorsCheckbox9', true); // MFT
        expect(await page.evaluate(() => document.querySelector('#gaq-detectorsCheckbox9').checked)).to.be.true;
        await pressElement(page, '#revert', true);
        await page.waitForFunction(() => !document.querySelector('#gaq-detectorsCheckbox9').checked);
        await pressElement(page, '#gaq-detectorsCheckbox9', true); // MFT
        await pressElement(page, '#send', true);
        await page.waitForSelector('#gaq-detector-selection-modal', { hidden: true });
        await page.waitForSelector('th#MFT-flag');
    });
};
