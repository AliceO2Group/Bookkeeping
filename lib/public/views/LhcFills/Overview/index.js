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
import table from '../../../components/Table/index.js';
import { amountSelector, pageSelector } from '../../../components/Pagination/index.js';
import { lhcFillsActiveColumns } from '../ActiveColumns/lhcFillsActiveColumns.js';

const AVAILABLE_AMOUNTS = [5, 10, 20];
const TABLEROW_HEIGHT = 46;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * The function to load the lhcFillironment overview
 * @param {Object} model The overall model object.
 * @returns {Object} The overview screen
 */
const lhcFillOverviewScreen = (model) => h('', {
    onremove: () => model.lhcFills.clearEnvs(),
}, showEnvsTable(model, model.lhcFills.lhcFills));

/**
 * The shows the lhcFillironment table
 * @param {Object} model The overall model object.
 * @param {Array} lhcFills Environment objects.
 * @returns {Object} Html page
 */
const showEnvsTable = (model, lhcFills) => {
    if (!model.lhcFills.rowCountFixed) {
        // Calculates the number of rows which should be visible on the page
        model.lhcFills.lhcFillsPerPage = model.calculateRowDisplayAmount(TABLEROW_HEIGHT, PAGE_USED_HEIGHT);
    }

    return [
        h('.flex-row.header-container.pv2'),
        h('.w-100.flex-column', [
            table(lhcFills, lhcFillsActiveColumns, {}, null, '.table-sm'),
            pagination(model),
        ]),
    ];
};

/**
 * Build a panel which will allow the user to select which page should be displayed
 * @param {object} model Global model to access functions
 * @returns {vnode} A panel with buttons to change pages within lhcFill table
 */
const pagination = (model) => {
    const amountDropdownVisible = model.lhcFills.isAmountDropdownVisible();
    return h('.flex-row.justify-between.pv3', [
        h('.w-15', amountSelector(() => {
            model.lhcFills.toggleLhcFillsDropdownVisible();
        }, (amount) => {
            model.lhcFills.lhcFillsPerPage = amount;
        }, amountDropdownVisible, AVAILABLE_AMOUNTS, model.lhcFills.lhcFillsPerPage, model.lhcFills)),
        pageSelector((page) => {
            model.lhcFills.selectedPage = page;
        }, model.lhcFills, model.lhcFills.setRowCountFixed(true)),
        h('.w-15'),
    ]);
};

export default (model) => [lhcFillOverviewScreen(model)];
