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
    checkMismatchingUrlParam,
    waitForNavigation,
    validateElement,
    expectColumnValues,
    setConfirmationDialogToBeDismissed,
    setConfirmationDialogToBeAccepted,
    unsetConfirmationdialogActions,
} = require('../defaults');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');

const { expect } = chai;

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
        const response = await goToPage(page, 'qc-flag-details-for-simulation-pass', { queryParameters: {
            id: 5,
            simulationPassId: 1,
            runNumber: 106,
            dplDetectorId: 1,
        } });

        expect(response.status()).to.equal(200);
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');

        await expectInnerText(page, 'h2', 'QC Flag Details');
    });

    it('can naviagate to runs per data pass page', async () => {
        await goToPage(page, 'qc-flag-details-for-simulation-pass', { queryParameters: {
            id: 5,
            simulationPassId: 1,
            runNumber: 106,
            dplDetectorId: 1,
        } });
        await waitForNavigation(page, () => pressElement(page, '#qc-flag-details-simulationPass a'));
        expect(await checkMismatchingUrlParam(page, { page: 'runs-per-simulation-pass', simulationPassId: '1' })).to.be.eql({});
    });

    it('can naviagate to run details page', async () => {
        await goToPage(page, 'qc-flag-details-for-simulation-pass', { queryParameters: {
            id: 5,
            simulationPassId: 1,
            runNumber: 106,
            dplDetectorId: 1,
        } });
        await waitForNavigation(page, () => pressElement(page, '#qc-flag-details-runNumber a'));
        expect(await checkMismatchingUrlParam(page, { page: 'run-detail', runNumber: '106' })).to.be.eql({});
    });

    it('should display correct QC flag details', async () => {
        await goToPage(page, 'qc-flag-details-for-simulation-pass', { queryParameters: {
            id: 5,
            simulationPassId: 1,
            runNumber: 106,
            dplDetectorId: 1,
        } });

        await expectInnerText(page, '#qc-flag-details-id', 'Id:\n5');
        await expectInnerText(page, '#qc-flag-details-simulationPass', 'Simulation pass:\nLHC23k6c');
        await expectInnerText(page, '#qc-flag-details-runNumber', 'Run:\n106');
        await expectInnerText(page, '#qc-flag-details-dplDetector', 'Detector:\nCPV');
        await expectInnerText(page, '#qc-flag-details-flagType', 'Type:\nBad');
        await expectInnerText(page, '#qc-flag-details-from', 'From:\n08/08/2019, 13:46:40');
        await expectInnerText(page, '#qc-flag-details-to', 'To:\n09/08/2019, 07:50:00');
        await expectInnerText(page, '#qc-flag-details-createdBy', 'Created by:\nJan Jansen');
        await expectInnerText(page, '#qc-flag-details-createdAt', 'Created at:\n13/02/2024, 11:57:20');
        await expectInnerText(page, '.panel div', 'Some qc comment 4');

        await validateElement(page, 'button#delete');
    });

    it('should successfuly delete QC flag', async () => {
        await goToPage(page, 'qc-flag-details-for-simulation-pass', { queryParameters: {
            id: 5,
            simulationPassId: 1,
            runNumber: 106,
            dplDetectorId: 1,
        } });
        await validateElement(page, 'button#delete');

        // Check that deletion is interapted when confirmation dialog is dismissed
        setConfirmationDialogToBeDismissed(page);
        await pressElement(page, 'button#delete');
        expect(await checkMismatchingUrlParam(page, {
            page: 'qc-flag-details-for-simulation-pass',
            id: '5',
            simulationPassId: '1',
            runNumber: '106',
            dplDetectorId: '1',
        })).to.be.eql({});

        // Delete
        setConfirmationDialogToBeAccepted(page);
        await waitForNavigation(page, () => pressElement(page, 'button#delete'));
        expect(await checkMismatchingUrlParam(page, {
            page: 'qc-flags-for-simulation-pass',
            simulationPassId: '1',
            runNumber: '106',
            dplDetectorId: '1',
        })).to.be.eql({});
        unsetConfirmationdialogActions(page);
    });

    it('should successfuly verify flag', async () => {
        await goToPage(page, 'qc-flag-details-for-simulation-pass', { queryParameters: {
            id: 6,
            simulationPassId: 1,
            runNumber: 106,
            dplDetectorId: 1,
        } });

        await validateElement(page, '#delete:not([disabled])');
        await expectInnerText(page, '#qc-flag-details-verified', 'Verified:\nNo');

        await page.waitForSelector('#submit', { hidden: true, timeout: 250 });
        await page.waitForSelector('#cancel-verification', { hidden: true, timeout: 250 });
        await page.waitForSelector('#verification-comment', { hidden: true, timeout: 250 });

        await pressElement(page, 'button#verify-qc-flag');
        await validateElement(page, '#verification-comment');
        await validateElement(page, '#cancel-verification');
        await validateElement(page, '#submit');

        await pressElement(page, 'button#cancel-verification');
        await page.waitForSelector('#submit', { hidden: true, timeout: 250 });
        await page.waitForSelector('#cancel-verification', { hidden: true, timeout: 250 });
        await page.waitForSelector('#verification-comment', { hidden: true, timeout: 250 });

        await pressElement(page, 'button#verify-qc-flag');
        await pressElement(page, '#verification-comment ~ .CodeMirror');
        const comment = 'Hello, it\'s ok';
        await page.keyboard.type(comment);

        await pressElement(page, '#submit');
        await expectColumnValues(page, 'createdBy', ['Anonymous']);
        await expectColumnValues(page, 'comment', [comment]);

        await expectInnerText(page, '#qc-flag-details-verified', 'Verified:\nYes');
        await validateElement(page, '#delete:disabled');
    });
};
