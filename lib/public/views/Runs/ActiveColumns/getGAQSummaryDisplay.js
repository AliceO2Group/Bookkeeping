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

import {
    h,
    iconWarning,
    iconReload,
    iconClock,
    sessionService,
} from '/js/src/index.js';
import { tooltip } from '../../../components/common/popover/tooltip.js';
import { getQcSummaryDisplay } from './getQcSummaryDisplay.js';
import { BkpRoles } from '../../../domain/enums/BkpRoles.js';
import spinner from '../../../components/common/spinner.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';

/**
 * Render an invalidated status indicator with tooltip
 *
 * @return {Component} invalidated display
 */
const invalidatedDisplay = () => h(
    '.d-inline-block.va-t-bottom',
    tooltip(h(
        '.f7',
        { id: 'clock-icon' },
        iconClock(),
    ), 'Summary is invalid. New summary will be calculated shortly. Please wait and refresh the page.'),
);

/**
 * Render a failure warning indicator with tooltip
 *
 * @return {Component} failure warning display
 */
const failureWarningDisplay = () => h(
    '.d-inline-block.va-t-bottom',
    tooltip(h('.f7', { id: 'warning-icon' }, iconWarning()), 'GAQ Summary failed, please click to view GAQ flags'),
);

/**
 * Render a recalculate button for GAQ summary
 *
 * @param {() => void} onRecalculate callback for recalculating GAQ summary
 * @return {Component} reload button
 */
const recalculateButton = (onRecalculate) => h(
    'button.btn.btn-group-item.last-item',
    {
        title: 'Recalculate GAQ for this run',
        onclick: (e) => {
            e.preventDefault();
            onRecalculate();
        },
    },
    iconReload(),
);

/**
 * Render the GAQ display for a successfully loaded summary
 *
 * @param {RunGaqSummary} gaqSummary the GAQ summary data
 * @param {boolean} isFirstInGroup whether this is the first button in a button group (affects styling)
 * @return {Component} the display element
 */
const getSuccessGaqDisplay = (gaqSummary, isFirstInGroup) => {
    const { undefinedQualityPeriodsCount, invalidated } = gaqSummary;

    // No summary exists at all (no QC flags configured for GAQ detectors)
    if (Object.keys(gaqSummary).length === 0) {
        return h(`button.btn.btn-primary.w-100${isFirstInGroup ? '.first-item' : ''}`, [
            'GAQ',
            h(
                '.d-inline-block.va-t-bottom',
                tooltip(
                    h('.f7', { id: 'warning-icon' }, iconWarning()),
                    'GAQ summary has not yet been calculated',
                ),
            ),
        ]);
    }

    if (undefinedQualityPeriodsCount === 0 && !invalidated) {
        return getQcSummaryDisplay(gaqSummary, isFirstInGroup ? { classes: 'first-item' } : {});
    }

    return h(`button.btn.btn-primary.w-100${isFirstInGroup ? '.first-item' : ''}`, [
        'GAQ',
        invalidated ? invalidatedDisplay() : null,
    ]);
};

/**
 * Render a loading indicator for GAQ summary
 *
 * @return {Component} loading spinner with tooltip
 */
const loadingDisplay = () => tooltip(
    h('.flex-row.items-center.justify-center.black', spinner({ size: 2, absolute: false })),
    'Loading GAQ summary...',
);

/**
 * Render display for GAQ summaries
 *
 * @param {RemoteData} remoteSummary the remote GAQ summary data
 * @param {number} dataPassId the data pass ID
 * @param {number} runNumber the run number to display GAQ for
 * @param {() => void} onRecalculate callback for recalculating GAQ summary
 * @return {Component} display
 */
export const getGAQSummaryDisplay = (remoteSummary, dataPassId, runNumber, onRecalculate) => {
    const hasRecalculateAccess = sessionService.hasAccess([BkpRoles.DPG_ASYNC_QC_ADMIN]);

    const gaqFlagLink = (content) => frontLink(content, 'gaq-flags', { dataPassId, runNumber }, { style: 'flex: 1' });

    return remoteSummary.match({
        Success: (gaqSummary) => h(
            `.flex-row.items-center${hasRecalculateAccess ? '.btn-group' : ''}`,
            [
                gaqFlagLink(getSuccessGaqDisplay(gaqSummary, hasRecalculateAccess)),
                hasRecalculateAccess ? recalculateButton(onRecalculate) : null,
            ],
        ),
        Loading: loadingDisplay,
        NotAsked: loadingDisplay,
        Failure: () => gaqFlagLink(h(
            'button.btn.btn-primary.w-100',
            ['GAQ', failureWarningDisplay()],
        )),
    });
};
