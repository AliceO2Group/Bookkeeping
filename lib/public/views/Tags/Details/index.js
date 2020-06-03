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
import targetURL from '../../../utilities/targetURL.js';
import ACTIVE_COLUMNS from '../../Logs/ActiveColumns/index.js';

/**
 * The VNode of the Tag Detail screen.
 *
 * @param {*} model Pass the model to access the defined functions.
 * @return {vnode} The VNode of the Tag Detail screen.
 */
const tagDetails = (model) => {
    if (!model.router.params.id) {
        model.router.go('?page=tag-overview');
        return;
    }

    if (!model.router.params.panel) {
        model.router.go(targetURL(model, 'panel', 'PanelMain'), true);
        return;
    }

    const data = model.tags.getTag();
    const dataLogs = model.tags.getLogsOfTag();

    if (data.isSuccess()) {
        const activePanel = model.router.params.panel;

        const panels = {
            main: {
                id: 'PanelMain',
                name: 'Main',
                content: 'content #1',
            },
            logs: {
                id: 'PanelLogs',
                name: 'Logs with this tag',
                content: [
                    dataLogs.isSuccess() && table(dataLogs.payload, ACTIVE_COLUMNS, (entry) => ({
                        style: 'cursor: pointer;',
                        onclick: () => model.router.go(`?page=entry&id=${entry.id}`),
                    })),
                    dataLogs.isLoading() && spinner({ absolute: false }),
                    dataLogs.isFailure() && dataLogs.payload.map((error) => h('.alert.alert-danger', error.title)),
                ],
            },
        };

        return [
            h('h1.mv1', { onremove: () => model.tags.clearTag() }, `Tag: ${data.payload.text}`),
            h('.w-100.flex-row.panel-tabs', Object.values(panels).map(({ id, name }) =>
                h(`.panel-tab.p2${activePanel === id ? '.active' : ''}`, {
                    onclick: () => activePanel !== id && model.router.go(targetURL(model, 'panel', id)),
                    id: id,
                }, name))),
            h('.w-100.flex-row', Object.values(panels).map(({ id, content }) =>
                activePanel === id && h('.panel-content.p2', content))),
        ];
    } else if (data.isLoading()) {
        return spinner();
    } else if (data.isFailure()) {
        return data.payload.map((error) => h('.alert.alert-danger', h('b', `${error.title}: `), error.detail));
    }
};

export default (model) => tagDetails(model);
