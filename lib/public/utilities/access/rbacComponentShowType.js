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

import { ShowType } from '../../domain/enums/ShowType.js';
import { permissions, DEFAULT } from './rbac.js';
import { validateRoles } from './rbacValidateRoles.js';

/**
 * Returns how to display a component based on the user's roles
 *
 * @param {String[]} userRoles the access roles the user currently has
 * @param {String} page the page that the component is on, e.g. Log create
 * @param {String} componentDescription a description of the component to show/not show
 * @returns {ShowType} how to display the component
 */
export const rbacShowComponent = (userRoles, page, componentDescription) => {
    const roles = validateRoles(userRoles);
    const pagePermissions = permissions[page];
    const showType = showTypeOfComponent(roles, pagePermissions, componentDescription);
    return showType;
};

/**
 * Given a user's roles, returns whether to display a specific component as Show, Disabled or Hide
 *
 * @param {String[]} roles the user's access roles
 * @param {Object} pagePermissions how to display all the components on the page based on role
 * @param {String} componentDescription a description of the component on the page
 * @returns {ShowType} how to display the component
 */
const showTypeOfComponent = (roles, pagePermissions, componentDescription) => {
    let componentPermissions;
    if (!pagePermissions?.[componentDescription]) {
        componentPermissions = DEFAULT;
    } else {
        componentPermissions = pagePermissions[componentDescription];
    }
    const userPermissionsForComponent = roles.map((role) => componentPermissions[role]);

    if (userPermissionsForComponent.includes(ShowType.SHOW)) {
        return ShowType.SHOW;
    } else if (userPermissionsForComponent.includes(ShowType.DISABLED)) {
        return ShowType.DISABLED;
    } else {
        return ShowType.HIDE;
    }
};
