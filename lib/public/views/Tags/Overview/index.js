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

let cachedPayload = null;

/**
 * Table row header
 * @param {object} model Pass the model to access the defined functions
 * @return {vnode} Return the view of the table with the filtering options
 */
const tagOverview = (model) => {
    const TABLEROW_HEIGHT = 45;
    const PAGE_USED_HEIGHT = 350;
    const rowCount = Math.floor((window.innerHeight - PAGE_USED_HEIGHT) / TABLEROW_HEIGHT);

    model.tags.setTagsPerPage(rowCount);

    const data = model.tags.getTags();
    const tagsColumns = activeColumns();

    const amountDropdownVisible = model.tags.isAmountDropdownVisible();
    const tagsPerPage = model.tags.getTagsPerPage();

    if (data.isSuccess()) {
        cachedPayload = data.payload;
    }

    const payload = data.isSuccess() ? data.payload : cachedPayload ? cachedPayload : [];

    return h('', { onremove: () => model.tags.clearTags() }, [
        data.isLoading() && spinner(),
        data.isFailure() && data.payload.map(errorAlert),
        h('.flex-row.justify-between.items-center', [
            h('h2.mv2', 'Tags'),
            h('button.btn.btn-primary.w-15.h2#create', {
                onclick: () => model.router.go('/?page=tag-create'),
            }, 'Create tag'),
        ]),
        h('.flex-row.mv1', [
            h('.w-100.mr3', h('.w-100.flex-column.mh3', [
                table(payload, tagsColumns, model, (entry) => ({
                    onclick: () => model.router.go(`?page=tag-detail&id=${entry.id}`),
                })),
                h('.flex-row.justify-between.mv3', [
                    h('.w-15', amountSelector(() =>
                        model.tags.toggleTagsDropdownVisible(), (amount) => model.tags
                        .setTagsPerPage(amount), amountDropdownVisible, AVAILABLE_AMOUNTS, tagsPerPage, model.tags)),
                    data.isSuccess()
                    && pageSelector((page) => model.tags.setSelectedPage(page), model.tags),
                    h('.w-15'),
                ]),
            ])),
        ]),
    ]);
};

export default (model) => [tagOverview(model)];
