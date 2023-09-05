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

import { validateRoles } from './rbacValidateRoles.js';
import { permissions, editableDetectorsByRole } from './rbac.js';
import { ShowType } from '../../domain/enums/ShowType.js';

/**
 * Given a user's roles, returns whether the user can edit all detectors, some detectors or no detectors
 * @param {String[]} roles the user's access roles
 * @param {Object} detectorPermissions the permissions object for what roles can edit the detectors
 * @returns {Object} whether the user can edit all detectors, some detectors or no detectors
 */
export const editableDetectors = (roles, detectorPermissions = permissions.edit) => {
    const userRoles = validateRoles(roles);
    const allowedDetectors = { allDetectors: false, detectors: [] };

    if (hasNonDetectorEditRights(userRoles, detectorPermissions)) {
        allowedDetectors.allDetectors = true;
    } else if (userHasDetectorRole(userRoles)) {
        allowedDetectors.detectors = detectorsUserCanEdit(userRoles);
    }

    return allowedDetectors;
};

/**
 * Returns whether a role is a detector-specific role
 * @param {String} role the role
 * @returns {Boolean} whether the role is a detector-specific role
 */
const isDetectorRole = (role) => Boolean(role.match(/det-[a-z]+/g));

/**
 * Returns whether the user holds at least one detector-specific role, e.g. det-emc
 * @param {String[]} roles the user's access roles
 * @returns {Boolean} whether the user holds at least one detector-specific role
 */
const userHasDetectorRole = (roles) => roles.map((role) => isDetectorRole(role)).some((role) => role === true);

/**
 * Checks whether a user is allowed to edit all detectors
 * (i.e. they have admin rights that override any detector-specific rights)
 * @param {String[]} roles the user's access roles
 * @param {Object} detectorPermissions the permissions object for what roles can edit the detectors
 * @returns {Boolean} whether the user has edit rights
 */
const hasNonDetectorEditRights = (roles, detectorPermissions) => {
    const nonDetectorRoles = roles.filter((role) => !isDetectorRole(role));
    const allowEdit = detectorPermissions[ShowType.SHOW]
        .some((role) => nonDetectorRoles.includes(role));
    return allowEdit;
};

/**
 * Returns an array of all the detectors a user can edit, based on their detector-specific roles
 * @param {String[]} roles the user's access roles
 * @returns {String[]} an array of the detectors the user can edit
 */
const detectorsUserCanEdit = (roles) => {
    const detectorSpecificRoles = roles.filter(isDetectorRole);
    const allowedDetectors = [];

    detectorSpecificRoles.forEach((role) => {
        const detectors = editableDetectorsByRole[role];
        allowedDetectors.push(...detectors);
    });

    return Array.from(new Set(allowedDetectors)); // Removes duplicates
};
