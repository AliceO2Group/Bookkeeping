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
import { logCollapsed } from '../../../components/Post/logCollapsed.js';
import { logExpanded } from '../../../components/Post/logExpanded.js';
import scrollTo from '../../../utilities/scrollTo.js';

/**
 * A collection of details relating to a log
 * @param {Model} model Pass the model to access the defined functions
 * @return {vnode} Return the view of the table with the filtering options
 */
const logDetailScreen = (model) => {
    const data = model.logs.getLogs();
    const { detailedPostsIds } = model.logs;

    if (data.isSuccess()) {
        const id = parseInt(model.router.params.id, 10);

        // eslint-disable-next-line require-jsdoc
        const logTreeItem = (item, level, isCollapsed) => h(
            '.mw-100',
            {
                style: {
                    'margin-left': `${2 * level}rem`,
                },
            },
            isCollapsed
                ? logCollapsed(item, item.id === id, () => model.logs.showPostDetailed(item.id))
                : logExpanded(model, item, item.id === id, () => model.logs.collapsePost(item.id)),
        );

        // eslint-disable-next-line require-jsdoc
        const tree = (obj, level = 0, items = []) => {
            if (level === 0) {
                model.logs.addPost(obj.id);
                items.push(logTreeItem(obj, level, !detailedPostsIds.includes(obj.id)));
                return tree(obj, level + 1, items);
            }

            for (const child of obj.children || []) {
                model.logs.addPost(child.id);
                items.push(logTreeItem(child, level, !detailedPostsIds.includes(child.id)));
                items = tree(child, level + 1, items);
            }

            return items;
        };

        return h('', [
            h('div.mv2.flex-row.items-center', [
                h('h2', 'Log Tree'),
                h('button.btn.btn-primary.mh2#toggleCollapse', {
                    onclick: () => {
                        model.logs.toggleAllPostView();
                    },
                }, !model.logs.isShowAll() ? 'Collapse all' : 'Show all'),
            ]),
            h('.w-100.flex-column', {
                oncreate: () => scrollTo(`#log-${id}`, 150),
            }, tree(data.payload[0])),
        ]);
    } else if (data.isFailure()) {
        return h('', [
            data.payload.map(errorAlert),
            h('button.btn.btn-primary.mv2', {
                onclick: () => model.router.go('?page=log-overview'),
            }, 'Return to Overview'),
        ]);
    } else if (data.isLoading()) {
        return spinner();
    }
};

export default (model) => logDetailScreen(model);
