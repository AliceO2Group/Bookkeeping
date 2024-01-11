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

import { h } from '@aliceo2/web-ui-frontend';
import spinner from '../../../components/common/spinner.js';
import { table } from '../../../components/common/table/table.js';
import targetURL from '../../../utilities/targetURL.js';
import { logsActiveColumns } from '../../Logs/ActiveColumns/logsActiveColumns.js';
import { tabLink } from '../../../components/common/navigation/tabLink.js';

/**
 * The VNode of the Subsystem Detail screen.
 *
 * @param {Model} model Pass the model to access the defined functions.
 * @return {vnode|void} The VNode of the Subsystem Detail screen.
 */
const subsystemDetails = (model) => {
    if (!model.router.params.id) {
        model.router.go('?page=subsystem-overview');
        return;
    }

    if (!model.router.params.panel) {
        model.router.go(targetURL(model, 'panel', 'main'), true);
        return;
    }

    const data = model.subsystems.getSubsystem();
    const dataLogs = model.subsystems.getLogsOfSubsystem();

    if (data.isSuccess()) {
        const activePanel = model.router.params.panel;

        const panels = {
            main: {
                name: 'Main',
                content: 'content #1',
            },
            logs: {
                name: 'Logs with this subsystem',
                content: table(dataLogs, logsActiveColumns, {
                    callback: (entry) => ({
                        style: {
                            cursor: 'pointer',
                        },
                        onclick: () => model.router.go(`?page=log-detail&id=${entry.id}`),
                    }),
                }),
            },
        };

        return [
            h('h2.mv2', { onremove: () => model.subsystems.clearSubsystem() }, `Subsystem: ${data.payload.name}`),
            h('.w-100', [
                h('ul.nav.nav-tabs', Object.entries(panels).map(([id, { name }]) =>
                    h('li.nav-item', tabLink(name, { panel: id }, { id: `${id}-tab` })))),
                h('.tab-content.p2', Object.entries(panels).map(([id, { content }]) =>
                    h(`.tab-pane${activePanel === id ? '.active' : ''}`, { id: `${id}-pane` }, content))),
            ]),
        ];
    } else if (data.isLoading()) {
        return spinner();
    } else if (data.isFailure()) {
        return data.payload.map((error) => h('.alert.alert-danger', h('b', `${error.title}: `), error.detail));
    }
};

export default (model) => subsystemDetails(model);
