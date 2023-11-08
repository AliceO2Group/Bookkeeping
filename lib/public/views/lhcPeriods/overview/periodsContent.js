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

import { h } from '/js/src/index.js';
import { RCT } from '../../../config.js';
import title from '../../../components/table/title.js';
import dataActionButtons, { dataActions } from '../../../components/buttons/dataActionButtons.js';
import { anyFiltersActive } from '../../../utils/filtering/filterUtils.js';
import { noDataFound, noMatchingData } from '../../../components/messagePanel/messages.js';
import periodsTableHeader from '../table/periodsTableHeader.js';
import periodsTableRow from '../table/periodsTableRow.js';
import tableManager from '../../../components/table/tableManager.js';
import filteringPanel from '../../../components/filter/filteringPanel.js';
import activeFilters from '../../../components/filter/activeFilters.js';
const pageName = RCT.pageNames.periods;

/**
 * Build components in case of runs retrieval success
 * @param {Model} model model to access global functions
 * @param {RemoteData<Run[]>} runs list of runs retrieved from server
 * @return {vnode[]} Returns a vnode with the table containing the runs
 */

const applicableDataActions = {
    [dataActions.hide]: true,
    [dataActions.reload]: true,
    [dataActions.downloadCSV]: true,
    [dataActions.copyLink]: true,
    [dataActions.showFilteringPanel]: true,
};

export default function periodsContent(periodsModel, model) {
    const periods = periodsModel.currentPagePeriods.payload;
    const { navigation, dataAccess } = model;

    const url = model.router.getUrl();

    return h('.p-1rem',
        h('.flex-wrap.justify-between.items-center',
            h('.flex-wrap.justify-between.items-center',
                title(pageName)),
            dataActionButtons(dataAccess, applicableDataActions, periodsModel)),

        periodsModel.isFilterPanelVisible ? filteringPanel(periodsModel) : '',
        periodsModel.filtering.isAnyFilterActive ? activeFilters(periodsModel.filtering) : '',

        periods.length > 0
            ? periodsModel.visibleFields.length > 0
                ? h('.p-top-05em',
                    h('.x-scrollable-table.border-sh',
                        tableManager(periodsModel),
                        h(`table.${pageName}-table`, {
                            id: `data-table-${pageName}`,
                        },
                        periodsTableHeader(periodsModel, pageName, periods),
                        h('tbody', { id: `table-body-${pageName}` },
                            periods.map((period) => periodsTableRow(
                                period, navigation, periodsModel,
                            ))))))
                : ''
            : anyFiltersActive(url)
                ? noMatchingData(dataAccess, pageName)
                : noDataFound(dataAccess));
}
