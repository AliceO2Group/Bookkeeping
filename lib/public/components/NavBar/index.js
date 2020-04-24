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
