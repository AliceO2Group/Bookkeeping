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

const BkpRolesNone = require('../../../domain/enums/BkpRoles');

/* Permissions for each access role, by page and component */

const permissions = {};

permissions['Log overview'] = {
    'Add Log Entry': {
        [BkpRolesNone.ADMIN]: true,
        [BkpRolesNone.GLOBAL]: true,
        [BkpRolesNone.DETCPV]: true,
        [BkpRolesNone.DETEMC]: true,
        [BkpRolesNone.GUEST]: false,
        [BkpRolesNone.DEFAULT]: false,
        [BkpRolesNone.PUBLIC]: false,
        [BkpRolesNone.NONE]: false,
    },
};

permissions['Log details'] = {
    'Reply': {
        [BkpRolesNone.ADMIN]: true,
        [BkpRolesNone.GLOBAL]: true,
        [BkpRolesNone.DETCPV]: true,
        [BkpRolesNone.DETEMC]: true,
        [BkpRolesNone.GUEST]: false,
        [BkpRolesNone.DEFAULT]: false,
        [BkpRolesNone.PUBLIC]: false,
        [BkpRolesNone.NONE]: false,
    },
};

permissions['Navigation bar'] = {
    'Create a new log': {
        [BkpRolesNone.ADMIN]: true,
        [BkpRolesNone.GLOBAL]: true,
        [BkpRolesNone.DETCPV]: true,
        [BkpRolesNone.DETEMC]: true,
        [BkpRolesNone.GUEST]: false,
        [BkpRolesNone.DEFAULT]: false,
        [BkpRolesNone.PUBLIC]: false,
        [BkpRolesNone.NONE]: false,
    },
    'Create a new end of shift report': {
        [BkpRolesNone.ADMIN]: true,
        [BkpRolesNone.GLOBAL]: true,
        [BkpRolesNone.DETCPV]: true,
        [BkpRolesNone.DETEMC]: true,
        [BkpRolesNone.GUEST]: false,
        [BkpRolesNone.DEFAULT]: false,
        [BkpRolesNone.PUBLIC]: false,
        [BkpRolesNone.NONE]: false,
    },
};

permissions['LHC fills'] = {
    'Annual statistics': {
        [BkpRolesNone.ADMIN]: true,
        [BkpRolesNone.GLOBAL]: true,
        [BkpRolesNone.DETCPV]: true,
        [BkpRolesNone.DETEMC]: true,
        [BkpRolesNone.GUEST]: false,
        [BkpRolesNone.DEFAULT]: false,
        [BkpRolesNone.PUBLIC]: false,
        [BkpRolesNone.NONE]: false,
    },
};

permissions['Run overview'] = {
    'Export runs': {
        [BkpRolesNone.ADMIN]: true,
        [BkpRolesNone.GLOBAL]: true,
        [BkpRolesNone.DETCPV]: true,
        [BkpRolesNone.DETEMC]: true,
        [BkpRolesNone.GUEST]: false,
        [BkpRolesNone.DEFAULT]: false,
        [BkpRolesNone.PUBLIC]: false,
        [BkpRolesNone.NONE]: false,
    },
};

permissions['Run details'] = {
    'Add Logs to this Run': {
        [BkpRolesNone.ADMIN]: true,
        [BkpRolesNone.GLOBAL]: true,
        [BkpRolesNone.DETCPV]: true,
        [BkpRolesNone.DETEMC]: true,
        [BkpRolesNone.GUEST]: false,
        [BkpRolesNone.DEFAULT]: false,
        [BkpRolesNone.PUBLIC]: false,
        [BkpRolesNone.NONE]: false,
    },
    'Edit Run': {
        [BkpRolesNone.ADMIN]: true,
        [BkpRolesNone.GLOBAL]: true,
        [BkpRolesNone.DETCPV]: true,
        [BkpRolesNone.DETEMC]: true,
        [BkpRolesNone.GUEST]: false,
        [BkpRolesNone.DEFAULT]: false,
        [BkpRolesNone.PUBLIC]: false,
        [BkpRolesNone.NONE]: false,
    },
    'Revert': {
        [BkpRolesNone.ADMIN]: true,
        [BkpRolesNone.GLOBAL]: true,
        [BkpRolesNone.DETCPV]: true,
        [BkpRolesNone.DETEMC]: true,
        [BkpRolesNone.GUEST]: false,
        [BkpRolesNone.DEFAULT]: false,
        [BkpRolesNone.PUBLIC]: false,
        [BkpRolesNone.NONE]: false,
    },
    'Save': {
        [BkpRolesNone.ADMIN]: true,
        [BkpRolesNone.GLOBAL]: true,
        [BkpRolesNone.DETCPV]: true,
        [BkpRolesNone.DETEMC]: true,
        [BkpRolesNone.GUEST]: false,
        [BkpRolesNone.DEFAULT]: false,
        [BkpRolesNone.PUBLIC]: false,
        [BkpRolesNone.NONE]: false,
    },
};

permissions['Tags'] = {
    'Create tag': {
        [BkpRolesNone.ADMIN]: true,
        [BkpRolesNone.GLOBAL]: true,
        [BkpRolesNone.DETCPV]: true,
        [BkpRolesNone.DETEMC]: true,
        [BkpRolesNone.GUEST]: false,
        [BkpRolesNone.DEFAULT]: false,
        [BkpRolesNone.PUBLIC]: false,
        [BkpRolesNone.NONE]: false,
    },
};

permissions['Tag details'] = {
    'Save': {
        [BkpRolesNone.ADMIN]: true,
        [BkpRolesNone.GLOBAL]: true,
        [BkpRolesNone.DETCPV]: true,
        [BkpRolesNone.DETEMC]: true,
        [BkpRolesNone.GUEST]: false,
        [BkpRolesNone.DEFAULT]: false,
        [BkpRolesNone.PUBLIC]: false,
        [BkpRolesNone.NONE]: false,
    },
    'Cancel': {
        [BkpRolesNone.ADMIN]: true,
        [BkpRolesNone.GLOBAL]: true,
        [BkpRolesNone.DETCPV]: true,
        [BkpRolesNone.DETEMC]: true,
        [BkpRolesNone.GUEST]: false,
        [BkpRolesNone.DEFAULT]: false,
        [BkpRolesNone.PUBLIC]: false,
        [BkpRolesNone.NONE]: false,
    },
    'Edit Tag': {
        [BkpRolesNone.ADMIN]: true,
        [BkpRolesNone.GLOBAL]: true,
        [BkpRolesNone.DETCPV]: true,
        [BkpRolesNone.DETEMC]: true,
        [BkpRolesNone.GUEST]: false,
        [BkpRolesNone.DEFAULT]: false,
        [BkpRolesNone.PUBLIC]: false,
        [BkpRolesNone.NONE]: false,
    },
};

exports.permissions = permissions;

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

exports.permissionsForDetectorsByRole = permissionsForDetectorsByRole;

/* Default values to use if permissions aren't listed above */

const DEFAULT = {
    [BkpRolesNone.ADMIN]: true,
    [BkpRolesNone.GLOBAL]: true,
    [BkpRolesNone.DETCPV]: false,
    [BkpRolesNone.DETEMC]: false,
    [BkpRolesNone.GUEST]: false,
    [BkpRolesNone.DEFAULT]: false,
    [BkpRolesNone.PUBLIC]: false,
    [BkpRolesNone.NONE]: false,
};

exports.DEFAULT = DEFAULT;
