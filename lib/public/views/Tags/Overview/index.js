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
import errorAlert from '../../../components/common/errorAlert.js';
import spinner from '../../../components/common/spinner.js';
import { amountSelector, pageSelector } from '../../../components/Pagination/index.js';
import activeColumns from '../ActiveColumns/index.js';

const AVAILABLE_AMOUNTS = [5, 10, 20];
const TABLEROW_HEIGHT = window.innerWidth < 900 ? 69 : 45;
const PAGE_USED_HEIGHT = 350;

/**
 * Table row header
 * @param {object} model Pass the model to access the defined functions
 * @return {vnode} Return the view of the table with the filtering options
 */
const tagOverview = (model) => {
    const data = model.tags.getTags();

    return h('', {
        onremove: () => model.tags.clearTags(),
    }, data.match({
        NotAsked: () => null,
        Loading: () => spinner({ size: 5, absolute: false }),
        Success: (tags) => showRunsTable(model, tags),
        Failure: (error) => errorAlert(error),
    }));
};

/**
 * Build components in case of tags retrieval success
 * @param {object} model model to access global functions
 * @param {Array<JSON>} tags list of tags retrieved from server
 * @return {vnode} Returns a vnode with the table containing the tags
 */
const showRunsTable = (model, tags) => {
    const tagsColumns = activeColumns();

    const amountDropdownVisible = model.tags.isAmountDropdownVisible();
    const tagsPerPage = model.tags.getTagsPerPage();
    if (!model.tags.getRowCountIsFixed()) {
        const tagsPerPage = model.calculateRowDisplayAmount(TABLEROW_HEIGHT, PAGE_USED_HEIGHT);
        model.tags.setTagsPerPage(tagsPerPage);
    }
    return [
        h('.flex-row.justify-between.items-center', [
            h('h2', 'Tags'),
            h('button.btn.btn-primary.w-15#create', {
                onclick: () => model.router.go('/?page=tag-create'),
            }, 'Create tag'),
        ]),
        h('.flex-row', [
            h('.w-100.flex-column', [
                table(tags, tagsColumns, model, (entry) => ({
                    onclick: () => model.router.go(`?page=tag-detail&id=${entry.id}`),
                })),
                h('.flex-row.justify-between.mv3', [
                    h('.w-15', amountSelector(() =>
                        model.tags.toggleTagsDropdownVisible(), (amount) => model.tags
                        .setTagsPerPage(amount), amountDropdownVisible, AVAILABLE_AMOUNTS, tagsPerPage, model.tags)),
                    pageSelector((page) => model.tags.setSelectedPage(page), model.tags, model.tags.setRowCountFixed(true)),
                    h('.w-15'),
                ]),
            ]),
        ]),
    ];
};

export default (model) => [tagOverview(model)];
