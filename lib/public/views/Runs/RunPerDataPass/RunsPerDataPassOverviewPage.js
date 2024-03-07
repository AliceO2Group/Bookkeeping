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

import { h, iconWarning, iconCog } from '/js/src/index.js';
import { table } from '../../../components/common/table/table.js';
import { createRunDetectorsActiveColumns } from '../ActiveColumns/runDetectorsActiveColumns.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
import { exportRunsTriggerAndModal } from '../Overview/exportRunsTriggerAndModal.js';
import { runsActiveColumns } from '../ActiveColumns/runsActiveColumns.js';
import spinner from '../../../components/common/spinner.js';
import { tooltip } from '../../../components/common/popover/tooltip.js';
import { breadcrumbs } from '../../../components/common/navigation/breadcrumbs.js';
import { dropdown } from '../../../components/common/popover/dropdown.js';

const TABLEROW_HEIGHT = 59;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Render Runs Per LHC Period overview page
 * @param {Model} model The overall model object.
 * @param {Model} [model.runs.perDataPassOverviewModel] model holding state for of the page
 * @return {Component} The overview page
 */
export const RunsPerDataPassOverviewPage = ({ runs: { perDataPassOverviewModel }, modalModel }) => {
    perDataPassOverviewModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    const { items: runs, detectors, dataPass } = perDataPassOverviewModel;

    const activeColumns = {
        ...runsActiveColumns,
        ...createRunDetectorsActiveColumns(detectors.match({
            Success: (payload) => payload,
            Other: () => [],
        }), { profiles: 'runsPerDataPass' }),
    };

    const commonTitle = h('h2', { style: 'white-space: nowrap;' }, 'Physics Runs');

    return h('', [
        h('.flex-row.justify-between.items-center.g2', [
            h(
                '.flex-row.g1.items-center',
                dataPass.match({
                    Success: (payload) => breadcrumbs([commonTitle, h('h2', payload.name)]),
                    Failure: () => [commonTitle, tooltip(h('.f3', iconWarning()), 'Not able to fetch data pass info')],
                    Loading: () => [commonTitle, spinner({ size: 2, absolute: false })],
                    NotAsked: () => [commonTitle, tooltip(h('.f3', iconWarning()), 'No data was asked for')],
                }),
            ),

            exportRunsTriggerAndModal(perDataPassOverviewModel, modalModel),
            dropdown(
                h('.clickable', iconCog()),
                h('.form-check.flex-row.items-center.p1.m1', [
                    h('input.form-check-input', {
                        id: 'xScrollCheck',
                        type: 'checkbox',
                        checked: perDataPassOverviewModel.xDisplayScrollable,
                        // eslint-disable-next-line no-return-assign
                        onchange: () => perDataPassOverviewModel.xDisplayScrollable = !perDataPassOverviewModel.xDisplayScrollable,
                    }),
                    h('label.form-check-label', {
                        for: 'xScrollCheck',
                    }, 'Table horizontall scroll'),
                ]),
            ),
        ]),
        h('.flex-column.w-100', [
            table(
                runs,
                activeColumns,
                null,
                { profile: 'runsPerDataPass', xScrollable: perDataPassOverviewModel.xDisplayScrollable, leftSticky: true },
            ),
            paginationComponent(perDataPassOverviewModel.pagination),
        ]),
    ]);
};
