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

import { permissions } from '../../../utilities/access/rbac.js';
import { linkOrDisabledOrNull } from '../../../utilities/access/rbacReturnComponent.js';
import { taggedEventRegistry } from '../../../utilities/taggedEventRegistry.js';
import { FILTER_PANEL_CLICK_TAG } from '../filtersConstants.js';

/**
 * Return a button to show/hide a filters panel
 *
 * @param {Object} filteringModel the model handling the filters state
 * @param {String[]} roles the user's access roles
 *
 * @return {vnode} the component to display
 */
export const filtersToggleButton = (filteringModel, roles) => linkOrDisabledOrNull(
    roles,
    permissions.showAll,
    `${filteringModel.areFiltersVisible ? 'Close' : 'Open'} filters`,
    null,
    null,
    {
        isLink: false,
        onclick: (e) => {
            filteringModel.toggleFiltersVisibility();
            taggedEventRegistry.tagEvent(e, FILTER_PANEL_CLICK_TAG);
        },
        class: 'btn btn-primary',
        id: 'openFilterToggle',
    },
);
