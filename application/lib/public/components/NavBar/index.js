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
import { iconPerson } from '/js/src/icons.js';

/**
 * Top header of the page
 * @param {Object} model Pass the model to access the defined functions
 * @param {Array} pages THe pages in defined in the view.js file
 * @return {vnode} Returns the navbar
 */
const navBar = (model, pages) =>
    h('.flex-row.justify-between.items-center.ph4.pv2.shadow-level2.level2.bg-gray-light', [
        h('.flex-column.items-center', [
            h('img', {
                style: 'width: 40px',
                src: './assets/alice.png',
            }),
            h('.f6', 'Logbook'),
        ]),
        h('btn-group', Object.keys(pages).map((tab) =>
            h(`button.btn.btn-tab ${model.router.params.page === tab ? 'selected' : ''}`, {
                onclick: () => model.router.go(`?page=${tab}`),
            }, tab[0].toUpperCase() + tab.slice(1)))),
        h('button.btn.h3', iconPerson()),
    ]);

export default navBar;
