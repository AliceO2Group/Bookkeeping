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

import { CopyToClipboardComponent, h } from '/js/src/index.js';

/**
 * Copies the url of the log to the clipboard
 *
 * @param {Log} log the log object that this button corresponds to
 * @return {Component} The link button.
 */
export const logLinkButton = (log) => {
    const url = `${window.location.origin}/?page=log-detail&id=${log.id}`;
    return h(CopyToClipboardComponent, { value: url, id: log.id }, 'Copy Link');
};
