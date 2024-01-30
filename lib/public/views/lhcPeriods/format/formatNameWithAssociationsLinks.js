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

import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { h } from '/js/src/index.js';

/**
 * Format Lhc Periods name with links to associations
 * @param {string} name lhcPeriodName
 * @param {LhcPeriod} periodParameters lhc period parameters
 * @return {Component} name cell display
 */
export const formatNameWithAssociationsLinks = (name, { id, runsCount, dataPassesCount }) =>
    h('.flex-row.flex-wrap.gc3', [
        h('.ph1.mh1.w-10', name),
        h('.mh4'),
        runsCount === 0
            ? h('.not-allowed.gray-darker', ['Runs', h('.badge', `(${runsCount})`)])
            : frontLink(
                ['Runs', h('.badge', `(${runsCount})`)],
                'runs-per-lhc-period',
                { lhcPeriodName: name },
            ),
        dataPassesCount === 0
            ? h('.not-allowed.gray-darker', ['Data Passes', h('.badge', `(${dataPassesCount})`)])
            : frontLink(
                ['Data Passes', h('.badge', `(${dataPassesCount})`)],
                'data-passes-per-lhc-period-overview',
                { lhcPeriodId: id },
            ),
    ]);
