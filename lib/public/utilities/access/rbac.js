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

import { BkpRolesNone } from '../../domain/enums/BkpRoles.js';
import { ShowType } from '../../domain/enums/ShowType.js';

/* Permissions for different kinds of actions. Defaults to HIDE */

const permissions = {};

permissions.create = {
    [ShowType.SHOW]: [
        BkpRolesNone.ADMIN,
        BkpRolesNone.GLOBAL,
        BkpRolesNone.DETCPV,
        BkpRolesNone.DETEMC,
    ],
    [ShowType.DISABLED]: [
        BkpRolesNone.GUEST,
        BkpRolesNone.DEFAULT,
    ],
    [ShowType.HIDE]: [
        BkpRolesNone.PUBLIC,
        BkpRolesNone.NONE,
    ],
};

permissions.edit = {
    [ShowType.SHOW]: [
        BkpRolesNone.ADMIN,
        BkpRolesNone.GLOBAL,
        BkpRolesNone.DETCPV,
        BkpRolesNone.DETEMC,
    ],
    [ShowType.DISABLED]: [
        BkpRolesNone.GUEST,
        BkpRolesNone.DEFAULT,
    ],
    [ShowType.HIDE]: [
        BkpRolesNone.PUBLIC,
        BkpRolesNone.NONE,
    ],
};

permissions.export = {
    [ShowType.SHOW]: [
        BkpRolesNone.ADMIN,
        BkpRolesNone.GLOBAL,
        BkpRolesNone.DETCPV,
        BkpRolesNone.DETEMC,
        BkpRolesNone.GUEST,
        BkpRolesNone.DEFAULT,
    ],
    [ShowType.DISABLED]: [
        BkpRolesNone.PUBLIC,
        BkpRolesNone.NONE,
    ],
    [ShowType.HIDE]: [],
};

permissions.showAll = {
    [ShowType.SHOW]: [
        BkpRolesNone.ADMIN,
        BkpRolesNone.GLOBAL,
        BkpRolesNone.DETCPV,
        BkpRolesNone.DETEMC,
        BkpRolesNone.GUEST,
        BkpRolesNone.DEFAULT,
        BkpRolesNone.PUBLIC,
        BkpRolesNone.NONE,
    ],
    [ShowType.DISABLED]: [],
    [ShowType.HIDE]: [],
};

permissions.disableAll = {
    [ShowType.SHOW]: [],
    [ShowType.DISABLED]: [
        BkpRolesNone.ADMIN,
        BkpRolesNone.GLOBAL,
        BkpRolesNone.DETCPV,
        BkpRolesNone.DETEMC,
        BkpRolesNone.GUEST,
        BkpRolesNone.DEFAULT,
        BkpRolesNone.PUBLIC,
        BkpRolesNone.NONE,
    ],
    [ShowType.HIDE]: [],
};

permissions.hideAll = {
    [ShowType.SHOW]: [],
    [ShowType.DISABLED]: [],
    [ShowType.HIDE]: [
        BkpRolesNone.ADMIN,
        BkpRolesNone.GLOBAL,
        BkpRolesNone.DETCPV,
        BkpRolesNone.DETEMC,
        BkpRolesNone.GUEST,
        BkpRolesNone.DEFAULT,
        BkpRolesNone.PUBLIC,
        BkpRolesNone.NONE,
    ],
};

/* Permissions for each detector, by access role */

const editableDetectorsByRole = {};

editableDetectorsByRole[BkpRolesNone.DETCPV] = ['CPV'];

editableDetectorsByRole[BkpRolesNone.DETEMC] = ['EMC'];

export { permissions, editableDetectorsByRole };