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
import errorAlert from '../../../components/common/errorAlert.js';
import spinner from '../../../components/common/spinner.js';
import table from '../../../components/Table/index.js';

const ACTIVE_COLUMNS = {
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
};

/**
 * The VNode of the Tag Overview screen.
 *
 * @param {*} model Pass the model to access the defined functions.
 * @return {vnode} The VNode of the Tag Overview screen.
 */
const tagOverview = (model) => {
    const data = model.tags.getTags();

    return [
        h('h2.mv2', { onremove: () => model.tags.clearTags() }, 'Tags'),
        data.match({
            NotAsked: () => {},
            Loading: () => spinner(),
            Success: (payload) => table(payload, ACTIVE_COLUMNS, model, (entry) => ({
                style: 'cursor: pointer;',
                onclick: () => model.router.go(`?page=tag&id=${entry.id}`),
            })),
            Failure: (payload) => payload.map(errorAlert),
        }),
    ];
};

export default (model) => [h('', tagOverview(model))];
