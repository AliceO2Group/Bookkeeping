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
import spinner from '../../../components/common/spinner.js';
import table from '../../../components/Table/index.js';

/**
 * The VNode of the Tag Overview screen.
 *
 * @param {*} model Pass the model to access the defined functions.
 * @return {vnode} The VNode of the Tag Overview screen.
 */
const tagOverview = (model) => {
    const data = model.tags.getTags();

    return [
        h('h1.mv1', { onremove: () => model.tags.clearTags() }, 'Tags'),
        data.isSuccess() && table(data.payload, {
            id: {
                name: 'Entry ID',
                visible: true,
                size: 'cell-l',
                primary: true,
            },
            text: {
                name: 'Name',
                visible: true,
                size: 'cell-l',
            },
        }, (entry) => ({
            style: 'cursor: pointer;',
            onclick: () => model.router.go(`?page=tag&id=${entry.id}`),
        })),
        data.isLoading() && spinner(),
        data.isFailure() && data.payload.map((error) => h('.alert.alert-danger', error.title)),
    ];
};

export default (model) => [h('', tagOverview(model))];
