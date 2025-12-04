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

import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';
import { formatDuration } from '../../../utilities/formatting/formatDuration.mjs';
import { formatPercentage } from '../../../utilities/formatting/formatPercentage.js';
import { CopyToClipboardComponent, h } from '/js/src/index.js';
import { iconPlus } from '/js/src/icons.js';
import { formatRunsList } from '../../Runs/format/formatRunsList.js';
import { formatLhcFillsTimeLoss } from '../format/formatLhcFillsTimeLoss.js';
import { buttonLinkWithDropdown } from '../../../components/common/selection/infoLoggerButtonGroup/buttonLinkWithDropdown.js';
import { infologgerLinksComponents } from '../../../components/common/externalLinks/infologgerLinksComponents.js';
import { formatBeamType } from '../../../utilities/formatting/formatBeamType.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { toggleStableBeamOnlyFilter } from '../../../components/Filters/LhcFillsFilter/stableBeamFilter.js';
import { fillNumberFilter } from '../../../components/Filters/LhcFillsFilter/fillNumberFilter.js';
import { beamDurationFilter } from '../../../components/Filters/LhcFillsFilter/beamDurationFilter.js';
import { runDurationFilter } from '../../../components/Filters/LhcFillsFilter/runDurationFilter.js';

/**
 * List of active columns for a lhc fills table
 */
export const lhcFillsActiveColumns = {
    fillNumber: {
        name: 'Fill #',
        visible: true,
        primary: true,
        size: 'w-8',
        format: (fillNumber, { runs = [] }) => buttonLinkWithDropdown(
            fillNumber,
            'lhc-fill-details',
            { fillNumber },
            [
                h(CopyToClipboardComponent, { value: fillNumber, id: fillNumber }, 'Copy Fill Number'),
                ...infologgerLinksComponents({ runNumbers: runs.map(({ runNumber }) => runNumber) }),
                frontLink(
                    [iconPlus(), ' Add log to this fill'],
                    'log-create',
                    { lhcFillNumbers: [fillNumber] },
                    { id: 'create-log', class: 'btn btn-primary h2' },
                ),
            ],
        ),
        filter: (lhcFillModel) => fillNumberFilter(lhcFillModel.filteringModel.get('fillNumbers')),
        profiles: {
            lhcFill: true,
            environment: true,
            home: true,
        },
    },
    stableBeamsStart: {
        name: 'SB START',
        visible: true,
        size: 'w-8',
        format: (timestamp) => formatTimestamp(timestamp, false),
        profiles: {
            lhcFill: true,
            environment: true,
            home: {
                size: 'w-20',
                format: (timestamp) => formatTimestamp(timestamp, true),
                balloon: true,
            },
        },
    },
    stableBeamsEnd: {
        name: 'SB END',
        visible: true,
        size: 'w-8',
        format: (timestamp) => formatTimestamp(timestamp, false),
        profiles: {
            lhcFill: true,
            environment: true,
            home: {
                size: 'w-20',
                format: (timestamp) => formatTimestamp(timestamp, true),
                balloon: true,
            },
        },
    },
    stableBeams: {
        name: 'Stable Beams Only',
        visible: false,
        format: (boolean) => boolean ? 'On' : 'Off',
        filter: (lhcFillModel) => toggleStableBeamOnlyFilter(lhcFillModel.filteringModel.get('hasStableBeams'), true),
    },
    stableBeamsDuration: {
        name: 'SB Duration',
        visible: true,
        size: 'w-8',
        format: (time, { stableBeamsStart, stableBeamsEnd }) => {
            if (time) {
                return formatDuration(time * 1000);
            }

            if (stableBeamsStart && !stableBeamsEnd) {
                return h('.badge.bg-success.white', 'ONGOING');
            }

            return '-';
        },
        filter: (lhcFillModel) => beamDurationFilter(
            lhcFillModel.filteringModel.get('beamDuration'),
            lhcFillModel.getBeamDurationOperator(),
            (value) => lhcFillModel.setBeamDurationOperator(value),
        ),
        profiles: {
            lhcFill: true,
            environment: true,
            home: {
                size: 'w-20',
            },
        },
    },
    timeLossAtStart: {
        name: 'Before 1st run',
        visible: true,
        size: 'w-8',
        format: (duration, lhcFill) => formatLhcFillsTimeLoss(duration, lhcFill.efficiencyLossAtStart, false),
    },
    timeLossAtEnd: {
        name: 'After last run',
        visible: false,
        size: 'w-8',
        format: (duration, lhcFill) => formatLhcFillsTimeLoss(duration, lhcFill.efficiencyLossAtEnd, false),
    },
    meanRunDuration: {
        name: 'Mean run duration',
        visible: true,
        size: 'w-8',
        format: (duration) => formatDuration(duration),
    },
    runsCoverage: {
        name: 'Total runs duration',
        visible: true,
        size: 'w-8',
        format: (duration) => formatDuration(duration),
        filter: (lhcFillModel) => runDurationFilter(
            lhcFillModel.filteringModel.get('runDuration'),
            lhcFillModel.getRunDurationOperator(),
            (value) => lhcFillModel.setRunDurationOperator(value),
        ),
    },
    efficiency: {
        name: 'Fill Efficiency',
        visible: true,
        size: 'w-8',
        format: (efficiency) => formatPercentage(efficiency),
        profiles: {
            lhcFill: true,
            environment: true,
            home: {
                size: 'w-20',
            },
        },
    },
    beamType: {
        name: 'Beam Type',
        visible: true,
        size: 'w-8',
        format: (value) => formatBeamType(value),
    },
    collidingBunches: {
        name: 'Colliding bunches',
        visible: true,
        size: 'w-8',
        format: (duration, lhcFill) => lhcFill.collidingBunchesCount ? lhcFill.collidingBunchesCount : '-',
    },
    fillingSchemeName: {
        name: 'Scheme name',
        visible: true,
        size: 'w-10',
        format: (value) => value ? value : '-',
        balloon: true,
    },
    runs: {
        name: 'Runs',
        visible: true,
        sortable: false,
        size: 'w-10',
        format: formatRunsList,
        balloon: true,
    },
};
