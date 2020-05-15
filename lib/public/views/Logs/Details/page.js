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
import PostBox from '../../../components/Post/index.js';

/**
 * A collection of details relating to a log
 * @param {object} model Pass the model to access the defined functions
 * @return {vnode} Return the view of the table with the filtering options
 */
const logDetailScreen = (model) => {
    const data = model.logs.getData();

    if (data && data.length !== 0) {
        const id = parseInt(model.router.params.id);
        const log = data.find((entry) => entry && entry.entryId === id);
        return h('.w-100.flex-column', [log.content.map((post, index) => h('.w-100', PostBox(post, index + 1)))]);
    } else {
        return h('', [
            h('.danger', 'This log could not be found.'),
            h('button.btn.btn-primary.mv3', {
                onclick: () => model.router.go('?page=home'),
            }, 'Return to Overview'),
        ]);
    }
};

export default (model) => [logDetailScreen(model)];
