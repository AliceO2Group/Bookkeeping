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
import table from '../../../components/Table/index.js';
import { amountSelector, pageSelector } from '../../../components/Pagination/index.js';
import { envsActiveColumns } from '../ActiveColumns/envsActiveColumns.js';

const AVAILABLE_AMOUNTS = [5, 10, 20];
const TABLEROW_HEIGHT = 46;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * The function to load the environment overview
 * @param {Model} model The overall model object.
 * @returns {Object} The overview screen
 */
const envOverviewScreen = (model) => h(
    '',
    {
        onremove: () => model.envs.clearEnvs(),
    },
    showEnvsTable(model, model.envs.envs),
);

/**
 * The shows the environment table
 * @param {Model} model The overall model object.
 * @param {RemoteData} envs Environment objects.
 * @returns {Object} Html page
 */
const showEnvsTable = (model, envs) => {
    if (!model.envs.rowCountFixed) {
        // Calculates the number of rows which should be visible on the page
        model.envs.envsPerPage = model.calculateRowDisplayAmount(TABLEROW_HEIGHT, PAGE_USED_HEIGHT);
    }

    return [
        h('.w-100.flex-column', [
            h('.header-container.pv2'),
            table(envs, envsActiveColumns, {}, null, '.table-sm'),
            pagination(model),
        ]),
    ];
};

/**
 * Build a panel which will allow the user to select which page should be displayed
 * @param {object} model Global model to access functions
 * @returns {Vnode} A panel with buttons to change pages within env table
 */
const pagination = (model) => {
    const amountDropdownVisible = model.envs.isAmountDropdownVisible();
    return h('.flex-row.justify-between.pv3', [
        h('.w-15', amountSelector(() => {
            model.envs.toggleEnvsDropdownVisible();
        }, (amount) => {
            model.envs.envsPerPage = amount;
        }, amountDropdownVisible, AVAILABLE_AMOUNTS, model.envs.envsPerPage, model.envs)),

        pageSelector((page) => {
            model.envs.selectedPage = page;
        }, model.envs, model.envs.setRowCountFixed(true)),
        h('.w-15'),
    ]);
};

export default (model) => [envOverviewScreen(model)];
