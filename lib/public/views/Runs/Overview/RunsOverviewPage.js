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

import { h } from '@aliceo2/web-ui/Frontend/js/src/index.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
import { exportRunsTriggerAndModal } from './exportRunsTriggerAndModal.js';
import { filtersPanelPopover } from '../../../components/Filters/common/filtersPanelPopover.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';
import { runsActiveColumns } from '../ActiveColumns/runsActiveColumns.js';
import { table } from '../../../components/common/table/table.js';
import runNumberFilter from '../../../components/Filters/RunsFilter/runNumber.js';
import { switchInput } from '../../../components/common/form/switchInput.js';
import { RunDefinition } from '../../../domain/enums/RunDefinition.js';

const TABLEROW_HEIGHT = 59;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Display a toggle switch to display physics runs only
 *
 * @param {RunsOverviewModel} runsOverviewModel the model of the runs overview
 * @returns {Component} the toggle switch
 */
export const togglePhysicsOnlyFilter = (runsOverviewModel) => {
    const isPhysicsOnly = runsOverviewModel.isDefinitionOnlyOneInFilter(RunDefinition.Physics);
    const onChange = isPhysicsOnly
        ? () => runsOverviewModel.setDefinitionFilter([])
        : () => runsOverviewModel.setDefinitionFilter([RunDefinition.Physics]);
    return switchInput(isPhysicsOnly, onChange, { labelAfter: 'PHYSICS ONLY' });
};

/**
 * Build components in case of runs retrieval success
 * @param {Model} model model to access global functions
 * @return {Component} Returns a vnode with the table containing the runs
 */
export const RunsOverviewPage = ({ runs: { overviewModel: runsOverviewModel }, modalModel }) => {
    runsOverviewModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    return h('', [
        h('.flex-row.header-container.g2.pv2', [
            filtersPanelPopover(runsOverviewModel, runsActiveColumns),
            h('.pl2#runOverviewFilter', runNumberFilter(runsOverviewModel)),
            togglePhysicsOnlyFilter(runsOverviewModel),
            exportRunsTriggerAndModal(runsOverviewModel, modalModel),
        ]),
        h('.flex-column.w-100', [
            table(runsOverviewModel.items, runsActiveColumns),
            paginationComponent(runsOverviewModel.pagination),
        ]),
    ]);
};
