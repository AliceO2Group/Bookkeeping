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
import * as rbac from './rbac.js';
import { validateRoles } from './rbacValidateRoles.js';

/**
 * Returns how to display a feature based on the user's roles
 *
 * @param {String[]} userRoles the access roles the user currently has
 * @param {String} page the page that the feature is on, e.g. Log create
 * @param {String} featureDescription a description of the feature to show/not show
 * @returns {ShowType} how to display the feature
 */
export const rbacShowFeature = (userRoles, page, featureDescription) => {
    const roles = validateRoles(userRoles);
    let permissions = {};
    switch (page) {
        case 'Log overview':
            permissions = rbac.logOverview;
            break;
        case 'Log details':
            permissions = rbac.logDetails;
            break;
        case 'Navigation bar':
            permissions = rbac.navBar;
            break;
        case 'LHC fills':
            permissions = rbac.lhcFills;
            break;
        case 'Run details':
            permissions = rbac.runDetails;
            break;
        case 'Run overview':
            permissions = rbac.runOverview;
            break;
        case 'Tags':
            permissions = rbac.tags;
            break;
        case 'Tag details':
            permissions = rbac.tagDetails;
            break;
    }
    const show = rolesToShowFeature(roles, permissions, featureDescription);
    return show;
};

/**
 * Given a user's roles, returns whether to display a specific component as Show, Disabled or Hide
 *
 * @param {String[]} roles the user's access roles
 * @param {Object} pagePermissions how to display all the features on the page based on role
 * @param {String} featureDescription a description of the feature on the page
 * @returns {ShowType} how to display the feature
 */
const rolesToShowFeature = (roles, pagePermissions, featureDescription) => {
    let featurePermissions;
    if (!pagePermissions?.[featureDescription]) {
        featurePermissions = rbac.DEFAULT;
    } else {
        featurePermissions = pagePermissions[featureDescription];
    }
    const userPermissionsForFeature = roles.map((role) => featurePermissions[role]);

    if (userPermissionsForFeature.includes(ShowType.SHOW)) {
        return ShowType.SHOW;
    } else if (userPermissionsForFeature.includes(ShowType.DISABLED)) {
        return ShowType.DISABLED;
    } else {
        return ShowType.HIDE;
    }
};
