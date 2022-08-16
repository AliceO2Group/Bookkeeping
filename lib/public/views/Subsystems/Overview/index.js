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
const subsystemOverview = (model) => [
    h('h2', { onremove: () => model.subsystems.clearSubsystems() }, 'Subsystems'),
    table(model.subsystems.getSubsystems(), ACTIVE_COLUMNS, {}, (entry) => ({
        onclick: () => model.router.go(`?page=subsystem-detail&id=${entry.id}`),
    })),
];

export default (model) => [h('', subsystemOverview(model))];
