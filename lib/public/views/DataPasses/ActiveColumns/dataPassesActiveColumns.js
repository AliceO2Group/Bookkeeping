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

import { textFilter } from '../../../components/Filters/common/filters/textFilter.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { formatSizeInBytes } from '../../../utilities/formatting/formatSizeInBytes.js';
import { formatItemsCount } from '../../../utilities/formatting/formatItemsCount.js';
import { badge } from '../../../components/common/badge.js';
import { sumNotNulls } from '../../../utilities/formatting/sumNotNulls.js';
import { h, iconDelete } from '/js/src/index.js';
import { formatDataPassName } from '../format/formatDataPassName.js';
import { DataPassVersionStatus } from '../../../domain/enums/DataPassVersionStatus.js';
import { formatDataPassStatusHistory } from '../format/formatStatusHistory.js';

/**
 * List of active columns for a generic data passes table
 */
export const dataPassesActiveColumns = {
    id: {
        visible: false,
    },

    name: {
        name: 'Name',
        visible: true,
        sortable: true,
        format: (_, dataPass) => formatDataPassName(dataPass),
        filter: ({ nameFilterModel }) => textFilter(
            nameFilterModel,
            { class: 'w-75 mt1', placeholder: 'e.g. LHC22a_apass1, ...' },
        ),
        balloon: true,
        classes: 'w-20',
    },

    associatedRuns: {
        name: 'Runs',
        visible: true,
        format: (_, { id, runsCount }) =>
            runsCount === 0
                ? 'No runs'
                : frontLink(
                    badge(runsCount),
                    'runs-per-data-pass',
                    { dataPassId: id },
                ),
        classes: 'w-10',
    },

    anchoredSimulationPasses: {
        name: 'Anchored',
        visible: true,
        format: (_, { id, simulationPassesCount }) =>
            simulationPassesCount === 0
                ? 'No MC'
                : frontLink(
                    badge(simulationPassesCount),
                    'anchored-simulation-passes-overview',
                    { dataPassId: id },
                ),
        classes: 'w-10',
        balloon: true,
    },

    description: {
        name: 'Description',
        visible: true,
        sortable: false,
        format: (_, { versions }) => versions?.map(({ description, statusHistory }) =>
            statusHistory[statusHistory.length - 1]?.status === DataPassVersionStatus.DELETED
                ? h('.flex-row.g1', [h('.gray-darker', iconDelete()), description])
                : description),
        balloon: true,
    },

    statusHistory: {
        name: 'Status history',
        format: (_, dataPass) => formatDataPassStatusHistory(dataPass),
        visible: true,
        classes: 'w-10',
    },

    reconstructedEventsCount: {
        name: 'Reconstructed Events',
        format: (_, { versions }) => formatItemsCount(sumNotNulls(versions.map(({ reconstructedEventsCount }) => reconstructedEventsCount))),
        visible: true,
        sortable: true,
        classes: 'w-10',
    },

    outputSize: {
        name: 'Output Size (B)',
        visible: true,
        format: (_, { versions }) => formatSizeInBytes(sumNotNulls(versions.map(({ outputSize }) => outputSize))),
        sortable: true,
        classes: 'w-10',
    },
};
