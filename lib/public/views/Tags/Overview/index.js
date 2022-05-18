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
import activeColumns from '../ActiveColumns/index.js';

/**
 * Table row header
 * @param {Model} model Pass the model to access the defined functions
 * @return {Vnode} Return the view of the table with the filtering options
 */
const tagOverview = (model) => {
    const data = model.tags.getTags();

    return h('', {
        onremove: () => model.tags.clearTags(),
    }, data.match({
        NotAsked: () => null,
        Loading: () => spinner({ size: 5, absolute: false }),
        Success: (tags) => showTagsTable(model, tags),
        Failure: (error) => errorAlert(error),
    }));
};

/**
 * Build components in case of tags retrieval success
 * @param {Model} model model to access global functions
 * @param {Array<JSON>} tags list of tags retrieved from server
 * @return {Vnode[]} Returns a vnode with the table containing the tags
 */
const showTagsTable = (model, tags) => {
    const tagsColumns = activeColumns();

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
                }), '.clickable'),
            ]),
        ]),
    ];
};

export default (model) => [tagOverview(model)];
