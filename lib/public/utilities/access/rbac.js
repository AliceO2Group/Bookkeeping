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

/* eslint-disable quote-props */

import { BkpRolesNone } from '../../domain/enums/BkpRoles.js';
import { ShowType } from '../../domain/enums/ShowType.js';

/* Permissions for each access role, by page and component */

const permissions = {};

permissions['Log overview'] = {
    'Add Log Entry': {
        [BkpRolesNone.ADMIN]: ShowType.SHOW,
        [BkpRolesNone.GLOBAL]: ShowType.SHOW,
        [BkpRolesNone.DETCPV]: ShowType.SHOW,
        [BkpRolesNone.DETEMC]: ShowType.SHOW,
        [BkpRolesNone.GUEST]: ShowType.DISABLED,
        [BkpRolesNone.DEFAULT]: ShowType.DISABLED,
        [BkpRolesNone.PUBLIC]: ShowType.HIDE,
        [BkpRolesNone.NONE]: ShowType.HIDE,
    },
};

permissions['Log details'] = {
    'Reply': {
        [BkpRolesNone.ADMIN]: ShowType.SHOW,
        [BkpRolesNone.GUEST]: ShowType.DISABLED,
        [BkpRolesNone.NONE]: ShowType.HIDE,
    },
};

permissions['Navigation bar'] = {
    'Create a new log': {
        [BkpRolesNone.ADMIN]: ShowType.SHOW,
        [BkpRolesNone.GUEST]: ShowType.DISABLED,
        [BkpRolesNone.NONE]: ShowType.HIDE,
    },
    'Create a new end of shift report': {
        [BkpRolesNone.ADMIN]: ShowType.SHOW,
        [BkpRolesNone.GUEST]: ShowType.DISABLED,
        [BkpRolesNone.NONE]: ShowType.HIDE,
    },
};

permissions['LHC fills'] = {
    'Annual statistics': {
        [BkpRolesNone.ADMIN]: ShowType.SHOW,
        [BkpRolesNone.GUEST]: ShowType.DISABLED,
        [BkpRolesNone.NONE]: ShowType.HIDE,
    },
};

permissions['Run overview'] = {
    'Export runs': {
        [BkpRolesNone.ADMIN]: ShowType.SHOW,
        [BkpRolesNone.GUEST]: ShowType.DISABLED,
        [BkpRolesNone.NONE]: ShowType.HIDE,
    },
};

permissions['Run details'] = {
    'Add Logs to this Run': {
        [BkpRolesNone.ADMIN]: ShowType.SHOW,
        [BkpRolesNone.GUEST]: ShowType.DISABLED,
        [BkpRolesNone.NONE]: ShowType.HIDE,
    },
    'Edit Run': {
        [BkpRolesNone.ADMIN]: ShowType.SHOW,
        [BkpRolesNone.GUEST]: ShowType.DISABLED,
        [BkpRolesNone.NONE]: ShowType.HIDE,
    },
    'Revert': {
        [BkpRolesNone.ADMIN]: ShowType.SHOW,
        [BkpRolesNone.GUEST]: ShowType.DISABLED,
        [BkpRolesNone.NONE]: ShowType.HIDE,
    },
    'Save': {
        [BkpRolesNone.ADMIN]: ShowType.SHOW,
        [BkpRolesNone.GUEST]: ShowType.DISABLED,
        [BkpRolesNone.NONE]: ShowType.HIDE,
    },
};

permissions['Tags'] = {
    'Create tag': {
        [BkpRolesNone.ADMIN]: ShowType.SHOW,
        [BkpRolesNone.GUEST]: ShowType.DISABLED,
        [BkpRolesNone.NONE]: ShowType.HIDE,
    },
};

permissions['Tag details'] = {
    'Save': {
        [BkpRolesNone.ADMIN]: ShowType.SHOW,
        [BkpRolesNone.GUEST]: ShowType.DISABLED,
        [BkpRolesNone.NONE]: ShowType.HIDE,
    },
    'Cancel': {
        [BkpRolesNone.ADMIN]: ShowType.SHOW,
        [BkpRolesNone.GUEST]: ShowType.DISABLED,
        [BkpRolesNone.NONE]: ShowType.HIDE,
    },
    'Edit Tag': {
        [BkpRolesNone.ADMIN]: ShowType.SHOW,
        [BkpRolesNone.GUEST]: ShowType.DISABLED,
        [BkpRolesNone.NONE]: ShowType.HIDE,
    },
};

/* Permissions for each detector, by access role */

const permissionsForDetectorsByRole = {};

permissionsForDetectorsByRole[BkpRolesNone.DETCPV] = {
    'CPV': true,
    'EMC': false,
};

permissionsForDetectorsByRole[BkpRolesNone.DETEMC] = {
    'CPV': false,
    'EMC': true,
};

/* Default values to use if permissions aren't listed above */

const DEFAULT = {
    [BkpRolesNone.ADMIN]: ShowType.SHOW,
    [BkpRolesNone.GUEST]: ShowType.HIDE,
    [BkpRolesNone.NONE]: ShowType.HIDE,
};

export { permissions, permissionsForDetectorsByRole, DEFAULT };
