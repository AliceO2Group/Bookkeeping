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

import { badge } from '../../../components/common/badge.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { tooltip } from '../../../components/common/popover/tooltip.js';
import { qcFlagTypeColoredBadge } from '../../../components/qcFlags/qcFlagTypeColoredBadge.js';
import { QcSummaryColors } from '../../../components/qcFlags/qcSummaryColors.js';
import { formatQcFlagEnd } from '../format/formatQcFlagEnd.js';
import { formatQcFlagStart } from '../format/formatQcFlagStart.js';
import { h, iconBan, iconWarning } from '/js/src/index.js';

/**
 * Render display of aggregated quality for list of QC flags in a GAQ period
 *
 * @param {QcFlag[]} contributingFlags list of flags in given GAQ period
 * @param {Detector[]} gaqDetectors list of all detectors which flags contribute to GAQ
 * @return {Component} display of aggregated quality
 */
const formatGeneralQuality = (contributingFlags, gaqDetectors) => {
    const flagTypes = contributingFlags.map(({ flagType }) => flagType);
    const allGood = flagTypes.every(({ bad }) => !bad);
    const someBadNotReproducible = flagTypes.some(({ bad, mcReproducible }) => bad && !mcReproducible);

    const missingVerifications = contributingFlags.some(({ verifications }) => verifications.length === 0);
    const missingDataTooltip = missingVerifications
        ? h('.d-inline-block.m1', tooltip(iconWarning(), h('.flex-column', h('', 'At least one flag is not verified'))))
        : null;

    const flagForSomeDetectorIsMissing = gaqDetectors.length !== contributingFlags.length;

    let qualityDisplay = null;
    if (flagForSomeDetectorIsMissing) {
        qualityDisplay = h('.gray-darker.m2.badge', tooltip(iconBan(), 'No flag for some detector'));
    } else if (allGood) {
        qualityDisplay = badge('good', { color: QcSummaryColors.ALL_GOOD });
    } else if (someBadNotReproducible) {
        qualityDisplay = badge('bad', { color: QcSummaryColors.ALL_BAD });
    } else {
        qualityDisplay = badge('MC.R', { color: QcSummaryColors.LIMITED_ACCEPTANCE_MC_REPRODUCIBLE });
    }

    return [qualityDisplay, missingDataTooltip];
};

/**
 * Render display of one QC flag for given detector
 *
 * @param {QcFlag[]} contributingFlags list of flags in given GAQ period
 * @param {object} scope scope of QC flag
 * @param {number} scope.dataPassId id of a data pass for which a QC flag is assigned
 * @param {number} scope.runNumber run number of run for which a QC flag is assigned
 * @param {number} scope.detectorId id of detector for which a QC flag is assigned
 * @return {Component} display of QC flag
 */
const formatGaqDetectorQuality = (contributingFlags, { dataPassId, runNumber, detectorId: targetDetectorId }) => {
    const flag = contributingFlags.find(({ detectorId }) => detectorId === targetDetectorId);
    if (!flag) {
        return h('.gray-darker.m2.badge', tooltip(iconBan(), 'No flag is assigned'));
    }

    const missingVerificationDisplay = (flag.verifications.length ?? 0) === 0
        ? h(
            '.d-inline-block.m1',
            tooltip(h('.f5', iconWarning()), 'This flag is not verified'),
        )
        : null;

    return frontLink(
        [
            missingVerificationDisplay,
            qcFlagTypeColoredBadge(flag.flagType),
        ],
        'qc-flag-details-for-data-pass',
        {
            id: flag.id,
            dataPassId,
            runNumber,
            detectorId: targetDetectorId,
        },
    );
};

/**
 * Factory for GAQ detectors related active columns configuration
 *
 * @param {Detector[]|Detector[]} gaqDetectors detectors list
 * @param {object} scope scope of GAQ flags
 * @param {number} scope.dataPassId id of data pass for which a QC flag is assigned
 * @param {number} scope.runNumber run number for which a QC flag is assigned
 * @return {object} active columns configuration
 */
export const createGaqFlagsActiveColumns = (
    gaqDetectors,
    { dataPassId, runNumber },
) => ({
    generalQuality: {
        name: 'Quality',
        visible: true,
        format: (_, { contributingFlags }) => formatGeneralQuality(contributingFlags, gaqDetectors),
        classes: 'w-10',
    },
    from: {
        name: 'From',
        visible: true,
        format: (_, qcFlag) => formatQcFlagStart(qcFlag),
        classes: 'w-10',
    },
    to: {
        name: 'To',
        visible: true,
        format: (_, qcFlag) => formatQcFlagEnd(qcFlag),
        classes: 'w-10',
    },
    ...Object.fromEntries(gaqDetectors.map(({ id: detectorId, name: detectorName }) => [
        `${detectorName}-flag`,
        {
            name: detectorName,
            visible: true,
            format: (_, { contributingFlags }) => formatGaqDetectorQuality(contributingFlags, { dataPassId, runNumber, detectorId }),
        },
    ])),
});
