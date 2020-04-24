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
const overviewScreen = (model) => {
    const data = model.overview.getData();
    const id = parseInt(model.router.params.id);
    let posts;

    data.forEach((entry) => {
        if (entry.entryID === id) {
            posts = entry.content;
        }
    });

    return h('.w-100.flex-column', [posts.map((post, index) => h('.w-100', PostBox(post, index + 1)))]);
};

export default (model) => [overviewScreen(model)];
