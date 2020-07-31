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

const ACTIVE_COLUMNS = {
    id: {
        name: 'Entry ID',
        visible: true,
        size: 'cell-l',
        primary: true,
    },
    name: {
        name: 'Name',
        visible: true,
        size: 'cell-l',
    },
};

/**
 * The VNode of the Subsystem Overview screen.
 *
 * @param {*} model Pass the model to access the defined functions.
 * @return {vnode} The VNode of the Subsystem Overview screen.
 */
const subsystemOverview = (model) => {
    const data = model.subsystems.getSubsystems();

    return [
        h('h2.mv2', { onremove: () => model.subsystems.clearSubsystems() }, 'Subsystems'),
        data.match({
            NotAsked: () => {},
            Loading: () => spinner(),
            Success: (payload) => table(payload, ACTIVE_COLUMNS, model, (entry) => ({
                style: 'cursor: pointer;',
                onclick: () => model.router.go(`?page=subsystem&id=${entry.id}`),
            })),
            Failure: (payload) => payload.map((error) => h('.alert.alert-danger', error.title)),
        }),
    ];
};

export default (model) => [h('', subsystemOverview(model))];
