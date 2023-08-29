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

import { linkOrDisabledOrNull } from '../../utilities/access/rbacReturnComponent.js';

/**
 * Returns a reply to Log button.
 *
 * @param {Log} log the log to which reply is created
 * @param {String[]} roles the user's access roles
 * @return {Component} The reply button.
 */
export const logReplyButton = (log, roles) => linkOrDisabledOrNull(
    roles,
    'Log details',
    'Reply',
    'log-create',
    { parentLogId: log.id },
    {
        class: 'btn btn-primary',
        id: `reply-to-${log.id}`,
    },
);
