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

/**
 * A singular post which is part of a log
 * @param {Object} post all data related to the post
 * @param {Number} index the identification index of the post
 * @return {vnode} Returns the navbar
 */
const entry = (post, index) =>
    h('.flex-column.p2.shadow-level1.mv2', {
        id: `post${index}`,
    }, [
        h('.f7.gray-darker', { style: 'align-self: flex-end;' }, `#${index}`),
        h('.w-100.bg-gray-light.mv1.ph1', post.content),
        h('.w-75.mv1.ph1', `Written by: ${post.sender}`),
    ]);

export default entry;
