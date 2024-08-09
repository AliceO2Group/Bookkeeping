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

import { h, iconWarning, iconBolt } from '/js/src/index.js';
import { formatFloat } from '../../../utilities/formatting/formatFloat.js';
import { getValueFromCssVar, isContrastBlack } from '../../../components/common/badge.js';
import { QcSummaryColors } from '../../../components/qcFlags/qcSummaryColors.js';
import { tooltip } from '../../../components/common/popover/tooltip.js';

const FULL_COVERAGE = 1;

/**
 * Render display common for QC and GAQ summaries
 *
 * @param {RunDetectorQcSummary|RunGaqSummary} summary summary
 * @return {Component} display
 */
export const getQcSummaryDisplay = (summary) => {
    const {
        badEffectiveRunCoverage,
        explicitlyNotBadEffectiveRunCoverage,
        missingVerificationsCount,
        mcReproducible,
    } = summary;

    const missingVerificationDisplay = missingVerificationsCount
        ? h(
            '.d-inline-block.va-t-bottom',
            tooltip(h('.f7', iconWarning()), `Missing ${missingVerificationsCount} verification${missingVerificationsCount > 1 ? 's' : ''}`),
        )
        : null;

    const notBadPercentageFormat = h('span', formatFloat((1 - badEffectiveRunCoverage) * 100, { precision: 0 }));

    const nonMcReproducibleQcSummaryContent = [
        notBadPercentageFormat,
        missingVerificationDisplay,
    ];

    /**
     * Format QC summary with color
     * @param {string|Component} content content
     * @param {string} [configuration.color] the color to look for contrast,
     * in hex RGB or CSS var() function over variable name expression: e.g. "var(--color-nice)"
     * @return {Component} QC summary display
     */
    const getQcSummaryDisplayWithColor = (content, { color }) => h(
        '.btn.w-100',
        { style: {
            backgroundColor: color,
            color: isContrastBlack(/var\(.+\)/.test(color) ? getValueFromCssVar(color.slice(4, -1)) : color) ? 'black' : 'white',
        } },
        content,
    );

    let qcSummaryDisplay = null;
    if ([badEffectiveRunCoverage, explicitlyNotBadEffectiveRunCoverage].includes(null)) {
        qcSummaryDisplay = getQcSummaryDisplayWithColor(
            [
                h('.d-inline-block', tooltip(
                    iconBolt(),
                    'Run start or stop is missing and time-based flag was assigned, coverage cannot be calculated',
                )),
                missingVerificationDisplay,
            ],
            {
                color: QcSummaryColors.INCALCULABLE_COVERAGE,
            },
        );
    } else if (!badEffectiveRunCoverage) {
        qcSummaryDisplay = getQcSummaryDisplayWithColor(
            nonMcReproducibleQcSummaryContent,
            {
                color: explicitlyNotBadEffectiveRunCoverage === FULL_COVERAGE
                    ? QcSummaryColors.ALL_GOOD
                    : QcSummaryColors.PARTIALLY_GOOD_NOT_BAD,
            },
        );
    } else if (!explicitlyNotBadEffectiveRunCoverage && mcReproducible) {
        qcSummaryDisplay = getQcSummaryDisplayWithColor(
            [
                notBadPercentageFormat,
                h('em.d-inline-block.va-top.f7', 'MC.R'),
                missingVerificationDisplay,
            ],
            { color: QcSummaryColors.LIMITED_ACCEPTANCE_MC_REPRODUCIBLE },
        );
    } else {
        qcSummaryDisplay = getQcSummaryDisplayWithColor(
            nonMcReproducibleQcSummaryContent,
            {
                color: badEffectiveRunCoverage === FULL_COVERAGE
                    ? QcSummaryColors.ALL_BAD
                    : QcSummaryColors.PARTIALLY_BAD,
            },
        );
    }

    return qcSummaryDisplay;
};
