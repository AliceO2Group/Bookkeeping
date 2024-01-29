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
import { buildUrl } from '../../../utilities/fetch/buildUrl.js';
import { SortModel } from '../../../components/common/table/SortModel.js';
import { TextTokensFilterModel } from '../../../components/Filters/common/filters/TextTokensFilterModel.js';
import { OverviewPageModel } from '../../../models/OverviewModel.js';

/**
 * Simulation Passes Per LHC Period overview model
 */
export class SimulationPassesAssociatedOverviewModel extends OverviewPageModel {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._overviewSortModel = new SortModel();
        this._overviewSortModel.observe(() => {
            this._pagination.silentlySetCurrentPage(1);
            this.load();
        });
        this._overviewSortModel.visualChange$.bubbleTo(this);

        this._namesFilterModel = new TextTokensFilterModel();
        this._registerFilter(this._namesFilterModel);
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    async load({ lhcPeriodId, dataPassId } = {}) {
        if (lhcPeriodId && !dataPassId) {
            this._lhcPeriodId = lhcPeriodId ?? this._lhcPeriodId;
        } else if (!lhcPeriodId && dataPassId) {
            this._dataPassId = dataPassId ?? this._dataPassId;
        } else if (lhcPeriodId && dataPassId) {
            throw new Error('Cannot load simulation with respect to lhcPeriod and dataPass at the same time');
        }
        super.load();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        const params = {
            filter: {
                names: this._namesFilterModel.normalized,
            },
        };
        if (this._lhcPeriodId) {
            params.filter.lhcPeriodIds = [this._lhcPeriodId];
        }
        if (this._dataPassId) {
            params.filter.dataPassIds = [this._dataPassId];
        }

        const { appliedOn: sortOn, appliedDirection: sortDirection } = this._overviewSortModel;
        if (sortOn && sortDirection) {
            params[`sort[${sortOn}]`] = sortDirection;
        }

        return buildUrl('/api/simulationPasses', params);
    }

    /**
     * Reset this model to its default
     *
     * @returns {void}
     */
    reset() {
        this._namesFilterModel.reset();/**
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
       import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';
       import { filtersPanelPopover } from '../../../components/Filters/common/filtersPanelPopover.js';
       import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
       import { simulationPassesActiveColumns } from '../ActiveColumns/simulationPassesActiveColumns.js';
       
       const TABLEROW_HEIGHT = 42;
       // Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
       const PAGE_USED_HEIGHT = 215;
       
       /**
        * Render Data Passes overview page
        * @param {Model} model The overall model object.
        * @returns {Component} The overview screen
        */
       export const SimulationPassesPerLhcPeriodOverviewPage = ({ simulationPasses: {
           perLhcPeriodOverviewModel: simulationPassesPerLhcPeriodOverviewModel } }) => {
           simulationPassesPerLhcPeriodOverviewModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
               TABLEROW_HEIGHT,
               PAGE_USED_HEIGHT,
           ));
       
           return h('', {
               onremove: () => simulationPassesPerLhcPeriodOverviewModel.reset(),
           }, [
               h('.flex-row.header-container.pv2', filtersPanelPopover(simulationPassesPerLhcPeriodOverviewModel, simulationPassesActiveColumns)),
               h('.w-100.flex-column', [
                   table(
                       simulationPassesPerLhcPeriodOverviewModel.items,
                       simulationPassesActiveColumns,
                       { classes: '.table-sm' },
                       null,
                       { sort: simulationPassesPerLhcPeriodOverviewModel.overviewSortModel },
                   ),
                   paginationComponent(simulationPassesPerLhcPeriodOverviewModel.pagination),
               ]),
           ]);
       };
       
        super.reset();
    }

    /**
     * Get id of current lhc period which data passes are fetched
     */
    get lhcPeriodId() {
        return this._lhcPeriodId;
    }

    /**
     * Returns the model handling the overview page table sort
     *
     * @return {SortModel} the sort model
     */
    get overviewSortModel() {
        return this._overviewSortModel;
    }

    /**
     * Returns data passes names filter model
     * @return {TextTokensFilterModel} data passes names filter model
     */
    get namesFilterModel() {
        return this._namesFilterModel;
    }

    /**
     * Register a new filter model
     * @param {FilterModel} filterModel the filter model to register
     * @return {void}
     * @private
     */
    _registerFilter(filterModel) {
        filterModel.visualChange$.bubbleTo(this);
        filterModel.observe(() => {
            this._pagination.silentlySetCurrentPage(1);
            this.load();
        });
    }

    /**
     * States whether any filter is active
     * @return {boolean} true if any filter is active
     */
    isAnyFilterActive() {
        return !this._namesFilterModel.isEmpty();
    }
}
