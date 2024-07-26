/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { h, iconBan, iconWarning } from '/js/src/index.js';
import { table } from '../../../components/common/table/table.js';
import { formatQcFlagStart } from '../format/formatQcFlagStart.js';
import { formatQcFlagEnd } from '../format/formatQcFlagEnd.js';
import { qcFlagTypeColoredBadge } from '../../../components/qcFlags/qcFlagTypeColoredBadge.js';
import { badge } from '../../../components/common/badge.js';
import { QC_SUMMARY_COLORS } from '../../../components/qcFlags/qcSummaryColors.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { tooltip } from '../../../components/common/popover/tooltip.js';
import { qcFlagsBreadcrumbs } from '../../../components/qcFlags/qcFlagsBreadcrumbs.js';

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

    const flagForSomeDettectorIsMissing = gaqDetectors.length !== contributingFlags.length;
    const missingVerifications = contributingFlags.some(({ verifications }) => verifications.length === 0);
    const missingDataMessage = [
        flagForSomeDettectorIsMissing ? h('', 'No flag for some detector') : '',
        missingVerifications ? h('', 'At least one flag is not verified') : '',
    ].filter((identity) => identity);

    const missingDataTooltip = missingDataMessage.length
        ? h('.d-inline-block.m1', tooltip(iconWarning(), h('.flex-column', missingDataMessage)))
        : null;

    if (allGood) {
        return [badge('good', { color: QC_SUMMARY_COLORS.ALL_GOOD }), missingDataTooltip];
    } else if (someBadNotReproducible) {
        return [badge('bad', { color: QC_SUMMARY_COLORS.ALL_BAD }), missingDataTooltip];
    } else {
        return [
            badge('MC.R', { color: QC_SUMMARY_COLORS.NO_GOOD_AND_LIMITED_ACCEPTANCE_MC_REPRODUCBILE }),
            missingDataTooltip,
        ];
    }
};

/**
 *
 * @param {*} contributingFlags
 * @returns
 */
const formatGaqDetectorQuality = (contributingFlags, { dataPassId, runNumber, detectorId }) => {
    const flag = contributingFlags.find(({ dplDetectorId }) => dplDetectorId === detectorId);
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
            dplDetectorId: detectorId,
        },
        { class: 'btn' },
    );
};

/**
 * Render GAQ Flags Overview page
 * @param {Model} model The overall model object.
 * @returns {Component} The overview page
 */
export const GaqFlagsOverviewPage = ({
    qcFlags: { gaqOverviewModel },
}) => {
    const {
        dataPass: remoteDataPass,
        dataPassId,
        run: remoteRun,
        runNumber,
        items: gaqFalgs,
        gaqDetectors: remoteGaqDetectors,
    } = gaqOverviewModel;

    const gaqDetectorsFlagsActiveColumns = Object.fromEntries(remoteGaqDetectors.match({
        Success: (gaqDetectors) => [
            [
                'generalQuality',
                {
                    name: 'Quality',
                    visible: true,
                    format: (_, { contributingFlags }) => formatGeneralQuality(contributingFlags, gaqDetectors),
                    classes: 'w-10',
                },
            ],
            ...gaqDetectors.map(({ id: detectorId, name: detectorName }) => [
                `${detectorName}-flag`, {
                    name: detectorName,
                    visible: true,
                    format: (_, { contributingFlags }) => formatGaqDetectorQuality(
                        contributingFlags,
                        { dataPassId, runNumber, detectorId },
                    ),
                },
            ]),
        ],
        Other: () => [],
    }));

    const activeColumns = {
        ...remoteGaqDetectors.match({
            Success: (gaqDetectors) =>({
                generalQuality: {
                    name: 'Quality',
                    visible: true,
                    format: (_, { contributingFlags }) => formatGeneralQuality(contributingFlags, gaqDetectors),
                    classes: 'w-10',
                },
            }),
            Other: () => ({}),
        }),
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
        ...remoteGaqDetectors.match({
            Success: (gaqDetectors) => Object.fromEntries(gaqDetectors.map(({ id: detectorId, name: detectorName }) => [
                `${detectorName}-flag`,
                {
                    name: detectorName,
                    visible: true,
                    format: (_, { contributingFlags }) => formatGaqDetectorQuality(contributingFlags, { dataPassId, runNumber, detectorId }),
                },
            ])),
            Other: () => ({}),
        }),
    };

    return h(
        '',
        { onremove: () => gaqOverviewModel.reset() },
        [
            h('.flex-row.justify-between.items-center', [qcFlagsBreadcrumbs({ remoteDataPass, remoteRun }, 'GAQ')]),
            h('.w-100.flex-column', [
                table(
                    gaqFalgs,
                    activeColumns,
                    { classes: '.table-sm' },
                    null,
                    { },
                ),
            ]),
        ],
    );
};
