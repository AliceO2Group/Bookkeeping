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
import { iconPerson, iconPlus } from '/js/src/icons.js';
import { frontLink } from '../../utilities/frontLink.js';
import { userPreferencesStore } from '../../utilities/userPreferencesStore.js';

let isChecked = true;

/**
 * Generic tab button for website navigation purposes
 * @param {Object} model Pass the model to access the defined functions
 * @param {String} id The internal page to navigate to
 * @param {String} text The text to display on the tab
 * @return {vnode} The generated tab button
 */
const pageTab = (model, id, text) => frontLink(text, id, null, {
    id,
    class: ['btn', 'btn-tab', model.router.params.page === id ? 'selected' : ''].join(' '),
    onclick: () => model.clearDropdownMenu(),
});

/**
 * Generic a tag for external and internal navigation purposes
 * @param {Object} model Pass the model to access the defined functions
 * @param {String} href The link to navigate to
 * @param {String} text The text to display on the link
 * @return {vnode} The generated link tag
 */
const pageLink = (model, href, text) =>
    h(`a.menu-item#${text.toLowerCase().replace(/ /g, '-')}`, {
        onclick: (e) => {
            model.clearDropdownMenu();
            model.router.handleLinkEvent(e);
        },
        href,
    }, text);

/**
 * Top header of the page
 * @param {Object} model Pass the model to access the defined functions
 * @return {vnode} Returns the navbar
 */
const navBar = (model) => {
    const { page } = model.router.params;
    return h('.flex-row.justify-between.items-center.p2.shadow-level2.level2.bg-gray-light', [
        h('.f4.gray-darker', 'Bookkeeping'),
        h('.btn-group', [
            pageTab(model, 'home', 'Home'),
            pageTab(model, 'log-overview', 'Log Entries'),
            pageTab(model, 'env-overview', 'Environments'),
            pageTab(model, 'lhc-fill-overview', 'LHC Fills'),
            pageTab(model, 'run-overview', 'Runs'),
            h(`.navbar-dropdown${model.dropdownMenu === 'overview' ? '.dropdown-open' : ''}`, [
                h('button#overviews', {
                    class: `btn btn-tab ${page === 'tag-overview' || page === 'subsystem-overview' ? 'selected' : ''}`,
                    onclick: () => model.toggleOverviewDropdown(),
                }, 'Overview'),
                h('.dropdown-menu', { style: 'width: max-content;' }, [
                    pageLink(model, '?page=tag-overview', 'Tag Overview'),
                    pageLink(model, '?page=subsystem-overview', 'Subsystem Overview'),
                ]),
            ]),
            pageTab(model, 'about-overview', 'About'),
        ]),

        h('.flex-row', [
            frontLink(iconPlus(), 'log-create', {}, {
                class: 'btn btn-primary',
                title: 'Create a new log',
            }),
            h('.navbar-dropdown', {
                id: '',
                title: 'User Actions',
                class: model.dropdownMenu === 'account' ? 'dropdown-open' : '',
            }, [
                h('button.btn', { onclick: () => model.toggleAccountDropdown() }, iconPerson()),
                h('.dropdown-menu', [
                    h('p.mh3.text-ellipsis', `Welcome ${model.session.name}`),
                    h('hr'),
                    pageLink(model, 'https://alice.its.cern.ch/jira/projects/O2B/summary', 'Jira'),
                    pageLink(model, 'https://github.com/AliceO2Group/Bookkeeping', 'GitHub'),
                    pageLink(model, 'https://alice-talk.web.cern.ch/c/o2/o2-bookkeeping/', 'Support Forum'),
                    h('hr'),
                    h('p.mh3.text-ellipsis', 'Preferences'),
                    h('.gray-darker.flex-row.g3.ph3.pv1', [
                        h('input', {
                            id: 'preferences-raw-timestamps',
                            onclick: () => {
                                userPreferencesStore.rawTimestamps = !userPreferencesStore.rawTimestamps;
                            },
                            type: 'checkbox',
                            checked: userPreferencesStore.rawTimestamps,
                        }),
                        h('label', {
                            for: 'preferences-raw-timestamps',
                        }, 'Display raw timestamps'),
                    ]),
                    h('hr'),
                    model.session.personid === 0 // Anonymous user has id 0
                        ? [
                            h('p', `user/admin slider \n privilages: ${isChecked ? 'admin' : 'user'}`),
                            h('label.switch', [
                                h('input', {
                                    onclick: () => {
                                        isChecked = !isChecked;
                                        model.session.access = isChecked ? ['admin'] : [];
                                    },
                                    type: 'checkbox',
                                    checked: isChecked,
                                }),
                                h('span.slider.round'),
                            ]),
                            h('p.mh3.gray-darker', 'This instance of the application does not require authentication.'),
                        ]
                        : pageLink(model, 'https://auth.cern.ch/auth/realms/cern/protocol/openid-connect/logout', 'Logout'),
                ]),
            ]),
        ]),
    ]);
};

export default navBar;
