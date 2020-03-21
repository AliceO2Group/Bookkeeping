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
 * Main view layout
 * @param {object} model - representing current application state
 * @return {vnode} application view to be drawn according to model
 */
export default (model) => [
    h('.flex-column.absolute-fill', [
        header(),
        content()
    ])
];

/**
 * Top header of the page
 * @param {object} model
 * @return {vnode}
 */
const header = () =>
    h('.p2.shadow-level2.level2', {
        style: 'display: flex; justify-content: center'
    }, 'Welcome to your home page');

/**
 * Page content
 * @param {object} model
 * @return {vnode}
 */
const content = () => h('', 'Add your content here');
