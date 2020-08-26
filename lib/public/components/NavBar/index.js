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
    h('.flex-row.justify-between.items-center.ph4.shadow-level2.level2.bg-gray-light', {
        style: 'min-height: 6rem;',
    }, [
        h('.flex-column.items-center', [
            h('img', {
                style: 'width: 40px',
                src: './assets/alice.png',
                alt: 'ALICE O2 logo',
            }),
            h('.f6', 'Bookkeeping'),
        ]),
        h('btn-group', Object.keys(pages).map((tab) =>
            h(`button#${tab}.btn.btn-tab ${model.router.params.page === tab ? 'selected' : ''}`, {
                onclick: () => model.router.go(`?page=${tab}`),
            }, tab[0].toUpperCase() + tab.slice(1)))),
        h('.dropleft', {
            title: 'Login', class: model.accountMenuEnabled ? 'dropdown-open' : '',
        }, [
            h('button.btn', { onclick: () => model.toggleAccountMenu() }, iconPerson()),
            h('.dropdown-menu', [
                h('p.m3.mv2.text-ellipsis', `Welcome ${model.session.name}`),
                h('hr'),
                h('a.menu-item', {
                    onclick: (e) => model.router.handleLinkEvent(e),
                    href: 'https://alice.its.cern.ch/jira/projects/O2B/summary',
                }, 'Jira'),
                h('a.menu-item', {
                    onclick: (e) => model.router.handleLinkEvent(e),
                    href: 'https://github.com/AliceO2Group/Bookkeeping',
                }, 'GitHub'),
                h('a.menu-item', {
                    onclick: (e) => model.router.handleLinkEvent(e),
                    href: 'https://alice-talk.web.cern.ch/c/o2/o2-bookkeeping/',
                }, 'Support Forum'),
                h('hr'),
                model.session.personid === 0 // Anonymous user has id 0
                    ? h('p.m3.gray-darker', 'This instance of the application does not require authentication.')
                    : h('a.menu-item', {
                        onclick: (e) => model.router.handleLinkEvent(e),
                        href: 'https://auth.cern.ch/auth/realms/cern/protocol/openid-connect/logout',
                    }, 'Logout'),
            ]),
        ]),
    ]);

export default navBar;
