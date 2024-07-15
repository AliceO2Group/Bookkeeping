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

    const activeColumns = {
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

        generalQuality: {
            name: 'Quality',
            visible: true,
            format: (_, { contributingFlags }) => {
                const flagTypes = contributingFlags.map(({ flagType }) => flagType);
                const allGood = flagTypes.every(({ bad }) => !bad);
                const mcReproducible = flagTypes.some(({ mcReproducible }) => mcReproducible);
                if (allGood) {
                    return badge('good', { color: QC_SUMMARY_COLORS.ALL_GOOD });
                } else if (mcReproducible) {
                    return badge('MC.R', { color: QC_SUMMARY_COLORS.NO_GOOD_AND_LIMITED_ACCEPTANCE_MC_REPRODUCBILE });
                } else {
                    return badge('bad', { color: QC_SUMMARY_COLORS.ALL_BAD });
                }
            },
            classes: 'w-10',
        },
        ...Object.fromEntries(remoteGaqDetectors.match({
            Success: (gaqDetectors) => gaqDetectors.map(({ id: detectorId, name: detectorName }) => {
                const a = 1;

                return [
                    `${detectorName}-flag`, {
                        name: detectorName,
                        visible: true,
                        format: (_, { contributingFlags }) => {
                            const flag = contributingFlags.find(({ dplDetectorId }) => dplDetectorId === detectorId);
                            if (!flag) {
                                return h('', iconBan());
                            }

                            const missingVerificationDisplay = (flag.verifications.length ?? 0) === 0
                                ? h(
                                    '.d-inline-block',
                                    tooltip(h('.f4', iconWarning()), 'This flag is not verified'),
                                )
                                : null;

                            return frontLink(
                                [
                                    qcFlagTypeColoredBadge(flag.flagType),
                                    missingVerificationDisplay,
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
                        },
                    },
                ];
            }),
            Other: () => [],
        })),

        /*
         * FlagTypes: {
         *     name: 'Types',
         *     visible: true,
         *     format: (_, { contributingFlags }) => contributingFlags.map(({ flagType }) => qcFlagTypeColoredBadge(flagType)),
         * },
         */
    };

    return h(
        '',
        { onremove: () => gaqOverviewModel.reset() },
        [
            h('.flex-row.justify-between.items-center', [
                // QcFlagsBreadcrumbs({ remoteDataPass, remoteRun, remoteDplDetector }),
            ]),
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
