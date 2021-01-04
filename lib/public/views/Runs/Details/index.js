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
import targetURL from '../../../utilities/targetURL.js';
import activeColumns from '../../Logs/ActiveColumns/index.js';
import activeColumnsFLP from '../../Flps/ActiveColumns/index.js';

/**
 * The VNode of the Run Detail screen.
 *
 * @param {*} model Pass the model to access the defined functions.
 * @return {vnode} The VNode of the Run Detail screen.
 */
const runDetails = (model) => {
    if (!model.router.params.id) {
        model.router.go('?page=run-overview');
        return;
    }

    if (!model.router.params.panel) {
        model.router.go(targetURL(model, 'panel', 'main'), true);
        return;
    }

    const data = model.runs.getRun();
    const dataLogs = model.runs.getLogsOfRun();
    const dataFlps = model.runs.getFlpsOfRun();
    const allTags = model.tags.getTags();
    const selectedTags = model.runs.getSelectedTags();

    if (data.isSuccess()) {
        const activePanel = model.router.params.panel;

        const panels = {
            main: {
                name: 'Main',
                content: Object.keys(data.payload).map((key) =>
                    h('.w-30rem.flex-row.justify-between', {}, h('b', `${key}: `), Array.isArray(data.payload[key]) ?
                        data.payload[key].map(({ text }) => text).join(', ') : data.payload[key])),
            },
            logs: {
                name: 'Logs with this run',
                content: dataLogs.match({
                    NotAsked: () => {
                    },
                    Loading: () => spinner({ absolute: false }),
                    Success: (payload) => table(payload, activeColumns(model), model, (entry) => ({
                        style: {
                            cursor: 'pointer',
                        },
                        onclick: () => model.router.go(`?page=log-detail&id=${entry.id}`),
                    })),
                    Failure: (payload) => payload.map((error) => h('.alert.alert-danger', error.title)),
                }),
            },
            flps: {
                name: 'FLPS with this run',
                content: dataFlps.match({
                    NotAsked: () => {
                    },
                    Loading: () => spinner({ absolute: false }),
                    Success: (payload) => table(payload, activeColumnsFLP(model), model, () => ({
                        style: {
                            cursor: 'pointer',
                        },
                    })),
                    Failure: (payload) => payload.map((error) => h('.alert.alert-danger', error.title)),
                }),
            },
        };

        return [
            h('h2.mv2', { onremove: () => model.runs.clearRun() }, `Run #${data.payload.runNumber}`),
            h('.flex-row.mv2', [
                h('button.btn.btn-primary.w-15.h2#create', {
                    onclick: () => model.router.go(`/?page=log-create&id=${data.payload.runNumber}`),
                }, 'Create Log'),
                h('button.btn.btn-success.w-15.mh2', {
                    onclick: () => model.runs.updateRunTags(),
                    title: 'This action will overwrite existing tags',
                    disabled: !model.runs.selectedTagsChanged(),
                }, 'Save tags'),
            ]),
            h('select#tags-control.form-control.w-25', {
                multiple: true,
                onchange: ({ target }) => model.runs.setSelectedTags(target.selectedOptions),
            }, allTags.isSuccess() ? [
                ...allTags.payload.map((tag) => h('option', {
                    value: tag.id,
                    selected: selectedTags.includes(tag.id),
                }, tag.text)),
            ] : h('option', { disabled: true }, 'Loading tags...')),
            h('.w-100', [
                h('ul.nav.nav-tabs', Object.entries(panels).map(([id, { name }]) =>
                    h('li.nav-item', h(`a.nav-link${activePanel === id ? '.active' : ''}`, {
                        onclick: (e) => activePanel !== id && model.router.handleLinkEvent(e),
                        href: targetURL(model, 'panel', id),
                        id: `${id}-tab`,
                    }, name)))),
                h('.tab-content.p2', Object.entries(panels).map(([id, { content }]) =>
                    h(`.tab-pane${activePanel === id ? '.active' : ''}`, { id: `${id}-pane` }, content))),
            ]),
        ];
    } else if (data.isLoading()) {
        return spinner();
    } else if (data.isFailure()) {
        return h('', [
            data.payload.map(errorAlert),
            h('button.btn.btn-primary.mv2', {
                onclick: () => model.router.go('?page=run-overview'),
            }, 'Return to Overview'),
        ]);
    }
};

export default (model) => runDetails(model);
