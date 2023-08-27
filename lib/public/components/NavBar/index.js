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
import { iconCog, iconPlus, iconPeople } from '/js/src/icons.js';
import { userPreferencesStore } from '../../utilities/userPreferencesStore.js';
import { frontLink } from '../common/navigation/frontLink.js';
import { absoluteFrontLink } from '../common/navigation/absoluteFrontLink.js';
import { BkpRoles, BKP_ROLES } from '../../domain/enums/BkpRoles.js';
import { linkOrDisabledOrNull } from '../../utilities/access/rbacReturnComponent.js';

let userRole = BkpRoles.GUEST;

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
const pageLink = (model, href, text) => absoluteFrontLink(
    text,
    href,
    {
        class: 'menu-item',
        id: text.toLowerCase().replace(/ /g, '-'),
        onclick: () => model.clearDropdownMenu(),
    },
);

/**
 * Top header of the page
 * @param {Object} model Pass the model to access the defined functions
 * @return {vnode} Returns the navbar
 */
const navBar = (model) => {
    const { page } = model.router.params;
    return h('.flex-row.justify-between.items-center.p2.shadow-level2.level2.bg-gray-light', [
        h(
            '.f4.gray-darker',
            model.session.personid === 0
                ? `Bookkeeping [as ${model.session.access.length > 0 ? model.session.access : 'none'}]`
                : 'Bookkeeping',
        ),
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

        h('.flex-row.g2', [
            linkOrDisabledOrNull(
                model.session.access,
                'Navigation bar',
                h('.flex-row.items-center.g1', [h('small', iconPlus()), 'Log']),
                'log-create',
                {},
                {
                    class: 'btn btn-primary',
                    title: 'Create a new log',
                },
            ),
            linkOrDisabledOrNull(
                model.session.access,
                'Navigation bar',
                h(
                    '.flex-row.items-center.g1',
                    [h('small', iconPlus()), 'EoS report'],
                ),
                'eos-report-create',
                {},
                {
                    class: 'btn bg-gray',
                    title: 'Create a new end of shift report',
                },
            ),
            h('.btn-group', [
                model.session.personid === 0 ? h(
                    'button.btn.bg-gray',
                    { onclick: () => model.toggleAccessDropdown(),
                        style: 'border-width: 1px; border-style: none inset none none' },
                    h('.f4', iconPeople()),
                ) : null,
                h(
                    'button.btn.bg-gray',
                    { onclick: () => model.toggleAccountDropdown() },
                    h('.f4', iconCog()),
                ),
            ]),
            h('.navbar-dropdown', {
                id: '',
                title: 'User Actions',
                class: model.dropdownMenu === 'account' ? 'dropdown-open' : '',
            }, h('.dropdown-menu', [
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
                        style: 'margin-top: 4%',
                    }),
                    h('label', {
                        for: 'preferences-raw-timestamps',
                    }, 'Display raw timestamps'),
                ]),
                h('hr'),
                model.session.personid === 0 // Anonymous user has id 0
                    ? h('p.mh3.gray-darker', 'This instance of the application does not require authentication.')
                    : pageLink(model, 'https://auth.cern.ch/auth/realms/cern/protocol/openid-connect/logout', 'Logout'),
            ])),
            model.session.personid === 0 ? h('.navbar-dropdown', {
                id: '',
                title: 'User Roles',
                class: model.dropdownMenu === 'access' ? 'dropdown-open' : '',
            }, h('.dropdown-menu', [
                h('p.mh3.text-ellipsis', `Welcome ${model.session.name}`),
                h('hr'),
                h('.m3', [
                    h('label', { for: 'select-role' }, 'Select an access level:'),
                    h('select.w-50', {
                        name: 'role',
                        id: 'select-role',
                        onchange: (e) => {
                            userRole = e.target.value;
                            model.session.access = userRole !== 'none' ? [userRole] : [];
                            model.dropdownMenu = false;
                            model.triggerNotify();
                        } }, [...BKP_ROLES, 'none'].map((role) =>
                        h('option', {
                            value: role,
                            id: `select-role-${role}`,
                        }, role.charAt(0).toUpperCase() + role.slice(1)))),
                ]),
            ])) : null,
        ]),
    ]);
};

export default navBar;
