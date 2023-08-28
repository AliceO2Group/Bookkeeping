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

export const logOverview = {
    'Add Log Entry': {
        [BkpRolesNone.ADMIN]: ShowType.SHOW,
        [BkpRolesNone.GUEST]: ShowType.DISABLED,
        [BkpRolesNone.NONE]: ShowType.HIDE,
    },
};

export const logDetails = {
    'Reply': {
        [BkpRolesNone.ADMIN]: ShowType.SHOW,
        [BkpRolesNone.GUEST]: ShowType.DISABLED,
        [BkpRolesNone.NONE]: ShowType.HIDE,
    },
};

export const navBar = {
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

export const lhcFills = {
    'Annual statistics': {
        [BkpRolesNone.ADMIN]: ShowType.SHOW,
        [BkpRolesNone.GUEST]: ShowType.DISABLED,
        [BkpRolesNone.NONE]: ShowType.HIDE,
    },
};

export const runOverview = {
    'Export runs': {
        [BkpRolesNone.ADMIN]: ShowType.SHOW,
        [BkpRolesNone.GUEST]: ShowType.DISABLED,
        [BkpRolesNone.NONE]: ShowType.HIDE,
    },
};

export const runDetails = {
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

export const tags = {
    'Create tag': {
        [BkpRolesNone.ADMIN]: ShowType.SHOW,
        [BkpRolesNone.GUEST]: ShowType.DISABLED,
        [BkpRolesNone.NONE]: ShowType.HIDE,
    },
};

export const tagDetails = {
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

export const DEFAULT = {
    [BkpRolesNone.ADMIN]: ShowType.SHOW,
    [BkpRolesNone.GUEST]: ShowType.HIDE,
    [BkpRolesNone.NONE]: ShowType.HIDE,
};
