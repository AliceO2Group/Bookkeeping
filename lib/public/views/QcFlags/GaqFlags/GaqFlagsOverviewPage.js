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

import { h } from '/js/src/index.js';
import { table } from '../../../components/common/table/table.js';
import { formatQcFlagStart } from '../format/formatQcFlagStart.js';
import { formatQcFlagEnd } from '../format/formatQcFlagEnd.js';
import { qcFlagTypeColoredBadge } from '../../../components/qcFlags/qcFlagTypeColoredBadge.js';
import { badge } from '../../../components/common/badge.js';
import { QC_SUMMARY_COLORS } from '../../../components/qcFlags/qcSummaryColors.js';

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
        run: remoteRun,
        dataPassId,
        items: gaqFalgs,
    } = gaqOverviewModel;

    const detectorsIds = gaqFalgs.flatMap(({ contributingFlags }) => contributingFlags.map(({ dplDetectorId }) => dplDetectorId));

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
        flagTypes: {
            name: 'Types',
            visible: true,
            format: (_, { contributingFlags }) => contributingFlags.map(({ flagType }) => qcFlagTypeColoredBadge(flagType)),
        },
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
