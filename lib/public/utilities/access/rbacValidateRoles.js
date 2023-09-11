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

import { BKP_ROLES, BkpRolesNone } from '../../domain/enums/BkpRoles.js';

/**
 * Checks that a list of roles contains only valid roles from BKP_ROLES
 *
 * @param {String[]} roles the user's access roles
 * @returns {String[]} the list of validated roles
 */
export const validateRoles = (roles) => {
    const validatedRoles = [];
    for (const role of roles) {
        if (BKP_ROLES.includes(role)) {
            validatedRoles.push(role);
        }
    }

    if (validatedRoles.length === 0) {
        return [BkpRolesNone.NONE];
    } else {
        return validatedRoles;
    }
};
