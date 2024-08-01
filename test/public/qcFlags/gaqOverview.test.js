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
    waitForTableToBeLoaded,
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

        await expectInnerText(page, 'h2:nth-of-type(1)', 'GAQ');
        await expectInnerText(page, 'h2:nth-of-type(2)', 'LHC22b_apass1');
        await expectInnerText(page, 'h2:nth-of-type(3)', '106');
    });

    it('shows correct datatypes in respective columns', async () => {
        // eslint-disable-next-line require-jsdoc
        const validateDate = (date) => date === '-' || !isNaN(dateAndTime.parse(date, 'DD/MM/YYYY hh:mm:ss'));
        const tableDataValidators = {
            generalQuality: (generalQuality) => ['good', 'bad', 'MC.R'].includes(generalQuality),
            from: (timestamp) => timestamp === 'Whole run coverage' || validateDate(timestamp),
            to: (timestamp) => timestamp === 'Whole run coverage' || validateDate(timestamp),
        };

        await validateTableData(page, new Map(Object.entries(tableDataValidators)));

        await waitForTableToBeLoaded(page);
        expect(await getTableContent(page)).to.have.all.deep.ordered.members([
            [
                'MC.R',
                '08/08/2019\n22:43:20',
                '09/08/2019\n04:16:40',
                'Limited Acceptance MC Reproducible',
                '',
            ],
            [
                'bad',
                '09/08/2019\n05:40:00',
                '09/08/2019\n07:03:20',
                'Limited acceptance',
                '',
            ],
            [
                'bad',
                '09/08/2019\n08:26:40',
                '09/08/2019\n09:50:00',
                'Bad',
                '',
            ],
        ]);

        await waitForNavigation(page, () => pressElement(page, 'h2:nth-of-type(2) a', true));
        await waitForNavigation(page, () => pressElement(page, '#row106-EMC a', true));
        await pressElement(page, '#flag-type-panel .popover-trigger', true);
        await pressElement(page, '#flag-type-dropdown-option-3', true);

        await page.waitForSelector('button#submit[disabled]', { hidden: true, timeout: 250 });
        await waitForNavigation(page, () => pressElement(page, 'button#submit', true));

        await waitForNavigation(page, () => pressElement(page, 'h2:nth-of-type(2) a', true));
        await waitForNavigation(page, () => pressElement(page, '#row106-globalAggregatedQuality a', true));

        await waitForTableToBeLoaded(page);
        expect(await getTableContent(page)).to.have.all.deep.ordered.members([
            [
                'good',
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
                'good',
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
                'good',
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
                'good',
                '09/08/2019\n09:50:00',
                '09/08/2019\n14:00:00',
                '',
                'Good',
            ],
        ]);

        expect(await getPopoverInnerText(await page.waitForSelector('tbody tr:nth-of-type(1) td .popover-trigger')))
            .to.be.equal('No flag for some detectorAt least one flag is not verified');

        expect(await getPopoverInnerText(await page.waitForSelector('tbody tr:nth-of-type(2) td .popover-trigger')))
            .to.be.equal('At least one flag is not verified');

        setConfirmationDialogToBeAccepted(page);

        // Verify QC flag of CPV detector
        expect(await getPopoverInnerText(await page.waitForSelector('tbody tr:nth-of-type(2) td:nth-of-type(4) .popover-trigger')))
            .to.be.equal('This flag is not verified');
        await waitForNavigation(page, () => pressElement(page, 'tbody tr:nth-of-type(2) td:nth-of-type(4) a', true));
        await pressElement(page, '#verify-qc-flag', true);
        await pressElement(page, '#submit', true);
        await waitForNavigation(page, () => pressElement(page, '#qc-flag-details-dataPass a', true));
        await waitForNavigation(page, () => pressElement(page, '#row106-globalAggregatedQuality a', true));
        await page.waitForSelector('tbody tr:nth-of-type(2) td:nth-of-type(4) .popover-trigger', { hidden: true });

        // Verify QC flag of EMC detector
        expect(await getPopoverInnerText(await page.waitForSelector('tbody tr:nth-of-type(2) td:nth-of-type(5) .popover-trigger')))
            .to.be.equal('This flag is not verified');
        await waitForNavigation(page, () => pressElement(page, 'tbody tr:nth-of-type(2) td:nth-of-type(5) a', true));
        await pressElement(page, '#verify-qc-flag', true);
        await pressElement(page, '#submit', true);
        await waitForNavigation(page, () => pressElement(page, '#qc-flag-details-dataPass a', true));
        await waitForNavigation(page, () => pressElement(page, '#row106-globalAggregatedQuality a', true));
        await page.waitForSelector('tbody tr:nth-of-type(2) td:nth-of-type(5) .popover-trigger', { hidden: true });

        await page.waitForSelector('tbody tr:nth-of-type(2) td:nth-of-type(1) .popover-trigger', { hidden: true });

        unsetConfirmationDialogActions(page);
    });
};
