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
import { iconMenu, iconPerson, iconPlus } from '/js/src/icons.js';
import { userPreferencesStore } from '../../utilities/userPreferencesStore.js';
import { frontLink } from '../common/navigation/frontLink.js';
import { absoluteFrontLink } from '../common/navigation/absoluteFrontLink.js';
import { externalLinks } from '../common/navigation/externalLinks.js';
import { configurationService } from '../../services/configurationService.js';
import { SHIFT_TYPES } from '../../domain/enums/ShiftTypes.js';
import { selectionDropdown } from '../common/selection/dropdown/selectionDropdown.js';

/**
 * Generic tab button for website navigation purposes
 * @param {string} page The internal page to navigate to
 * @param {string} content The text to display on the tab
 * @param {Function<Event, void>} onclick the html element onclick function
 * @param {boolean} isSelected if true component is styled as selected
 * @return {Component} The generated tab button
 */
const basePageTab = (page, content, onclick, isSelected = false) => frontLink(
    content,
    page,
    null,
    {
        id: page,
        class: ['btn', 'btn-tab', isSelected ? 'selected' : ''].join(' '),
        onclick,
    },
);

/**
 * Generic menu link button for website navigation purposes
 * @param {string} content The link to navigate to
 * @param {string} page The internal page to navigate to
 * @param {Function<Event, void>} onclick the html element onclick function
 * @param {boolean} isSelected if true component is styled as selected
 * @param {object} [options] additional options
 * @param {boolean} [options.isSelected] force the selected state (defaults to the current page being the linked one)
 * @param {object} [options.params] query parameters of the page to navigate to
 * @param {object} [options.attributes] additional html attributes of the link
 * @return {Component} The generated link tag
 */
const basePageMenuLink = (content, page, onclick, isSelected = false, { params = null, attributes = {} } = {}) => frontLink(
    content,
    page,
    params,
    {
        class: ['menu-item', isSelected ? 'selected' : ''].join(' '),
        onclick,
        ...attributes,
    },
);

/**
 * Generic menu link button for external navigation purposes
 * @param {string} content The link to navigate to
 * @param {string} href The text to display on the link
 * @param {Function<Event, void>} onclick the html element onclick function
 * @return {Component} The generated link tag
 */
const baseAbsoluteMenuLink = (content, href, onclick) => absoluteFrontLink(
    content,
    href,
    {
        class: 'menu-item',
        onclick,
    },
);

/**
 * Return a tab that, when clicked, opens new tab with ali-flp page
 * @param {String} [aliFlpIndexPageUrl] ali-flp index page url
 * @returns {vnode} tab
 */
const aliFlpLinkTab = (aliFlpIndexPageUrl) => absoluteFrontLink(
    'ALI FLP',
    aliFlpIndexPageUrl,
    {
        class: 'btn btn-tab',
        target: '_blank',
    },
);

const NAVIGATION_PAGES = [
    ['home', 'Home'],
    ['log-overview', 'Log Entries'],
    ['env-overview', 'Environments'],
    ['lhc-fill-overview', 'LHC Fills'],
    ['run-overview', 'Runs'],
    ['lhc-period-overview', 'RCT'],
    ['statistics', 'Statistics'],
];

const OVERVIEW_PAGES = [
    ['tag-overview', 'Tag Overview'],
    ['qc-flag-types-overview', 'QC Flag Types'],
];

const btnGroupsDelimiter = h('.mh1', { style: { 'border-left': '1px solid var(--color-gray-dark)' } });

/**
 * Build navigation bar dropdown menu
 * @param {string|icon} dropdownButtonContent content of button which opens dropdown menu
 * @param {boolean} isOpened if true dropdown will be opened
 * @param {Function<Event, void>} onclick the html element onclick function
 * @param {Component[]} entries entries of the menu
 * @param {object} options options of the dropdown menu
 * @param {object} [options.menuAttributes] attributes of dropdown menu
 * @param {boolean} [options.isSelected] inform whether dropdown should be styled as selected
 * @param {string} [options.dropdownAttributes] attributes of dropdown button
 * @param {string} [options.buttonClass] css class of the dropdown button
 * @param {object} [options.buttonAttributes] additional html attributes of the dropdown button
 * @return {Component} dropdown menu
 */
const dropdownSubMenu = (dropdownButtonContent, isOpened, onclick, entries, { menuAttributes, isSelected, dropdownAttributes, buttonClass = 'btn-tab', buttonAttributes = {} } = {}) =>
    h(`.navbar-dropdown ${isOpened ? '.dropdown-open' : ''}`, dropdownAttributes, [
        h('button', {
            class: `btn ${buttonClass} ${isSelected ? 'selected' : ''}`,
            onclick,
            ...buttonAttributes,
        }, dropdownButtonContent),
        h('.dropdown-menu', menuAttributes, entries),
    ]);

/**
 * Top header of the page
 * @param {Object} model Pass the model to access the defined functions
 * @return {vnode} Returns the navbar
 */
function navBar(model) {
    const { page: currentPage } = model.router.params;
    const pageTab = (page, content) => basePageTab(page, content, () => model.clearDropdownMenu(), currentPage === page);
    const pageMenuLink = (content, page, options) =>
        basePageMenuLink(content, page, () => model.clearDropdownMenu(), options?.isSelected ?? currentPage === page, options);
    const absoluteMenuLink = (content, page) => baseAbsoluteMenuLink(content, page, () => model.clearDropdownMenu());

    const aliFlpIndexUrl = configurationService.configuration$.getCurrent().match({
        Success: (configuration) => configuration.AliFlpIndexUrl,
        Other: () => null,
    });

    const accountMenu = dropdownSubMenu(iconPerson(), model.isDropdownMenuOpened('account'), () => model.toggleDropdownMenu('account'), [
        h('p.mh3.text-ellipsis', `Welcome ${model.session.name}`),
        h('hr'),
        absoluteMenuLink('Jira', `${externalLinks.ALICE_JIRA}/projects/O2B/summary`),
        absoluteMenuLink('GitHub', externalLinks.BOOKKEEPING_GITHUB),
        absoluteMenuLink('Support Forum', externalLinks.BOOKKEEPING_SUPPORT_FORUM),
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
            ? h('.mh3', [
                h('p', 'Roles selection dropdown'),
                selectionDropdown(
                    model.userRoleSelectionModel,
                    { selectorPrefix: 'bkp-roles' },
                ),
                h('p.gray-darker', 'This instance of the application does not require authentication.'),
            ])
            : absoluteMenuLink('Logout', 'https://auth.cern.ch/auth/realms/cern/protocol/openid-connect/logout'),
    ], { dropdownAttributes: { title: 'User Actions' }, menuAttributes: { class: 'navbar-dropdown-menu-left' } });

    return h('#navbar.flex-row.justify-between.items-center.p2.shadow-level2.level2.bg-gray-light.relative', [
        h('.flex-row.items-center.g2', [
            accountMenu,
            h('button#navbar-menu-toggle.btn.btn-tab.navbar-menu-toggle', {
                title: 'Navigation menu',
                onclick: () => model.toggleDropdownMenu('navigation'),
            }, iconMenu()),
            h('.f4.gray-darker#navbar-title', 'Bookkeeping'),
        ]),
        model.isDropdownMenuOpened('navigation') && h('.navbar-menu.navbar-menu-toggle.flex-column.p2.bg-white.shadow-level3', [
            aliFlpIndexUrl && absoluteMenuLink('ALI FLP', aliFlpIndexUrl),
            ...NAVIGATION_PAGES.map(([page, content]) => pageMenuLink(content, page)),
            h('hr'),
            h('p.mh3.gray-darker.f6', 'Overview'),
            ...OVERVIEW_PAGES.map(([page, content]) => pageMenuLink(content, page)),
            pageMenuLink('About', 'about-overview'),
        ]),
        h('.btn-group.navbar-links', [
            ...configurationService.configuration$.getCurrent().match({

                /**
                 * Render ALI flp link tabs
                 *
                 * @param {AppConfiguration} configuration the app configuration
                 * @return {Component} the flp link
                 */
                Success: (configuration) => [
                    aliFlpLinkTab(configuration.AliFlpIndexUrl),
                    btnGroupsDelimiter,
                ],
                Other: () => [],
            }),
            ...NAVIGATION_PAGES.map(([page, content]) => pageTab(page, content)),
            dropdownSubMenu('Overview', model.isDropdownMenuOpened('overview'), () => model.toggleDropdownMenu('overview'), [
                ...OVERVIEW_PAGES.map(([page, content]) => pageMenuLink(content, page)),
            ], {
                menuAttributes: { style: 'width: max-content;' },
                isSelected: OVERVIEW_PAGES.some(([page]) => page === currentPage),
            }),
            pageTab('about-overview', 'About'),
        ]),

        h('.flex-row.g2', [
            dropdownSubMenu(
                h('.flex-row.items-center.g1', [h('small', iconPlus()), h('span.navbar-create-label', 'Add an entry')]),
                model.isDropdownMenuOpened('create'),
                () => model.toggleDropdownMenu('create'),
                [
                    pageMenuLink('Log entry', 'log-create', { isSelected: false, attributes: { id: 'create-log-button' } }),
                    pageMenuLink('On-call log', 'log-create', { isSelected: false, params: { templateKey: 'on-call' } }),
                    pageMenuLink('RC daily meeting log', 'log-create', { isSelected: false, params: { templateKey: 'rc-daily-meeting' } }),
                    h('hr'),
                    h('.menu-title', 'EoS report'),
                    ...SHIFT_TYPES.map((shiftType) => pageMenuLink(shiftType, 'eos-report-create', { isSelected: false, params: { shiftType } })),
                ],
                {
                    buttonClass: 'btn-primary flex-shrink-0 navbar-create-button',
                    buttonAttributes: { id: 'create-menu-button', title: 'Create a new log or end of shift report' },
                    menuAttributes: { style: 'width: max-content;' },
                },
            ),
        ]),
    ]);
}

export default navBar;
