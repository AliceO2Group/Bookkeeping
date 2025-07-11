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
import targetURL from '../../../utilities/targetURL.js';
import flpRun from '../../../components/FlpRun/index.js';
import { currentPageAndParameters } from '../../../utilities/currentPageAndParameters.js';
import { tabLink } from '../../../components/common/navigation/tabLink.js';

// eslint-disable-next-line jsdoc/require-returns-check
/**
 * The VNode of the Flp Detail screen.
 *
 * @param {Model} model Pass the model to access the defined functions.
 * @return {vnode} The VNode of the Flp Detail screen.
 */
const flpDetails = (model) => {
    if (!model.router.params.id) {
        model.router.go('?page=flp-overview');
        return;
    }

    if (!model.router.params.panel) {
        model.router.go(targetURL(model, 'panel', 'main'), true);
        return;
    }

    const data = model.flps.getFlp();

    if (data.isSuccess()) {
        const activePanel = model.router.params.panel;

        const panels = {
            main: {
                name: 'Main',
                content: flpRun(model, data.payload),
            },
        };

        return [
            h('h2.mv2', { onremove: () => model.flps.clearFlps() }, `Flp #${data.payload.name}`),
            h('.w-100', [
                h('ul.nav.nav-tabs', Object.entries(panels).map(([id, { name }]) => {
                    const { parameters } = currentPageAndParameters();
                    parameters.panel = id;
                    return h('li.nav-item', tabLink(
                        name,
                        parameters,
                        {
                            id: `${id}-tab`,
                        },
                    ));
                })),
                h('.tab-content.p2', Object.entries(panels)
                    .map(([id, { content }]) => h(`.tab-pane${activePanel === id ? '.active' : ''}`, { id: `${id}-pane` }, content))),
            ]),
        ];
    } else if (data.isLoading()) {
        return spinner();
    } else if (data.isFailure()) {
        return h('', [
            data.payload.map(errorAlert),
            h('button.btn.btn-primary.mv2', {
                onclick: () => model.router.go('?page=flp-overview'),
            }, 'Return to Overview'),
        ]);
    }
    return;
};

export default (model) => flpDetails(model);
