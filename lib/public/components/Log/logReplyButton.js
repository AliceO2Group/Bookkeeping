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

import { frontLink } from '../common/navigation/frontLink.js';

/**
 * Returns a reply to Log button.
 *
 * @param {Log} log the log to which reply is created
 * @return {Component} The reply button.
 */
export const logReplyButton = (log) => frontLink(
    'Reply',
    'log-create',
    { parentLogId: log.id },
    {
        id: `reply-to-${log.id}`,
        class: 'btn btn-primary mr1',
    },
);
