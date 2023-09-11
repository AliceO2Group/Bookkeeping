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
import { validateRoles } from './rbacValidateRoles.js';

/**
 * Returns how to display a component based on the user's roles
 *
 * @param {String[]} userRoles the access roles the user currently has
 * @param {String} componentPermissions how to display the component based on role
 * @returns {ShowType} how to display the component
 */
export const rbacShowComponent = (userRoles, componentPermissions) => {
    const roles = validateRoles(userRoles);
    const showType = showTypeOfComponent(roles, componentPermissions);
    return showType;
};

/**
 * Given a user's roles, returns whether to display a specific component as Show, Disabled or Hide
 * Defaults to HIDE
 *
 * @param {String[]} userRoles the user's access roles
 * @param {Object} componentPermissions how to display the component based on role
 * @returns {ShowType} how to display the component
 */
const showTypeOfComponent = (userRoles, componentPermissions) => {
    const userPermissionsForComponent = [];
    for (const [showType, allowedRoles] of Object.entries(componentPermissions)) {
        if (allowedRoles.some((role) => userRoles.includes(role))) {
            userPermissionsForComponent.push(showType);
        }
    }

    if (userPermissionsForComponent.includes(ShowType.SHOW)) {
        return ShowType.SHOW;
    } else if (userPermissionsForComponent.includes(ShowType.DISABLED)) {
        return ShowType.DISABLED;
    } else {
        return ShowType.HIDE;
    }
};
