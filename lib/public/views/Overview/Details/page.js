/**
 * This file is part of the ALICE Electronic Logbook v2, also known as Jiskefet.
 * Copyright (C) 2020  Stichting Hogeschool van Amsterdam
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
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
