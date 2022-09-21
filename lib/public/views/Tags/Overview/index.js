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
import { table } from '../../../components/common/table/table.js';
import { tagsActiveColumns } from '../ActiveColumns/tagsActiveColumns.js';

/**
 * Table row header
 * @param {Model} model Pass the model to access the defined functions
 * @return {vnode} Return the view of the table with the filtering options
 */
const tagOverview = (model) => h(
    '',
    { onremove: () => model.tags.overview.reset() },
    showTagsTable(model, model.tags.overview.tagsList),
);

/**
 * Build components in case of tags retrieval success
 * @param {Model} model model to access global functions
 * @param {RemoteData} tags list of tags retrieved from server
 * @return {vnode} Returns a vnode with the table containing the tags
 */
const showTagsTable = (model, tags) => [
    h('.flex-row.justify-between.items-center', [
        h('h2', 'Tags'),
        model.isAdmin() && [
            h('button.btn.btn-primary.w-15#create', {
                onclick: () => model.router.go('/?page=tag-create'),
            }, 'Create tag'),
        ],
    ]),
    h('.flex-row', [
        h('.w-100.flex-column', [
            table(tags, tagsActiveColumns, {
                callback: (entry) => ({
                    onclick: () => model.router.go(`?page=tag-detail&id=${entry.id}`),
                }),
                classes: '.clickable',
            }, null, { filter: model.tags.overview }),
        ]),
    ]),
];

export default (model) => [tagOverview(model)];
