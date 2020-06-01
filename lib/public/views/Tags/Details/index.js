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
import ACTIVE_COLUMNS from '../../Logs/ActiveColumns/index.js';

/**
 * Returns the target URL containing the new panel property value,
 *
 * @param {*} model Pass the model to access the defined functions.
 * @param {*} panel Id of the panel.
 * @returns {String} The new target URL.
 */
const targetURL = (model, panel) => {
    let target = '';
    let seenPanel = false;
    for (const pair of Object.entries(model.router.params)) {
        const [key] = pair;
        let [, value] = pair;

        if (key === 'panel') {
            value = panel;
            seenPanel = true;
        }

        if (target === '') {
            target += `?${key}=${value}`;
        } else {
            target += `&${key}=${value}`;
        }
    }

    if (!seenPanel) {
        target += `&panel=${panel}`;
    }

    return target;
};

/**
 * The VNode of the Tag Detail screen.
 *
 * @param {*} model Pass the model to access the defined functions.
 * @return {vnode} The VNode of the Tag Detail screen.
 */
const tagDetails = (model) => {
    const data = model.tags.getTag();
    const dataLogs = model.tags.getLogsOfTag();

    if (!model.router.params.panel) {
        model.router.go(targetURL(model, 'PanelButton1'), true);
        return;
    }

    if (data.isSuccess()) {
        const activePanel = model.router.params.panel;

        const panels = {
            main: {
                name: 'Main',
                content: 'content #1',
            },
            logs: {
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
            h('.w-100.flex-row.panel-tabs', Object.entries(panels).map(([, { name }], index) =>
                h(`.panel-tab.p2${activePanel === `PanelButton${index + 1}` ? '.active' : ''}`, {
                    // eslint-disable-next-line require-jsdoc
                    onclick() {
                        if (activePanel !== this.id) {
                            model.router.go(targetURL(model, this.id));
                        }
                    },
                    id: `PanelButton${index + 1}`,
                }, name))),
            h('.w-100.flex-row', Object.entries(panels).map(([, { content }], index) =>
                activePanel === `PanelButton${index + 1}` && h('.panel-content.p2', content))),
        ];
    } else if (data.isLoading()) {
        return spinner();
    } else if (data.isFailure()) {
        return data.payload.map((error) => h('.alert.alert-danger', h('b', `${error.title}: `), error.detail));
    }
};

export default (model) => tagDetails(model);
