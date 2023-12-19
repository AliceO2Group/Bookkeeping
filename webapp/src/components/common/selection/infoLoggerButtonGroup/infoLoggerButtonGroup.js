/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

import { h } from '@aliceo2/web-ui-frontend';
import { getInfologgerLinksUrls } from '../../../../services/externalRouting/getInfologgerLinksUrls.js';
import { CopyToClipboardComponent } from './CopyToClipboardComponent.js';
import { identifierColumnAndActionsDropdown } from './identifierColumnAndActionsDropdown.js';

/**
 * Returns an infologger link component for the given infologger link url and label.
 *
 * @param {string} infologgerLinkUrl The infologger url for the link.
 * @param {string} label The label for the link.
 * @return {Component|null} The infologger link component, or null if the infologger is not available.
 */
const infoLoggerLink = (infologgerLinkUrl, label) => infologgerLinkUrl && h('a', { href: infologgerLinkUrl, target: '_blank' }, label);

/**
 * Renders a button group that links to a specific details page based on the given parameters,
 * and a dropdown menu with options to copy the link or access the related infologgers.
 *
 * @param {Object} parameters The parameters that specify what links to display for the details page and the infologgers.
 * @return {Component} The infologger button group component.
 */
export const infoLoggerButtonGroup = (parameters) => {
    const { flp: flpInfologgerLinkUrl, epn: epnInfologgeLinkrUrl } = getInfologgerLinksUrls(parameters);
    const flpInfologgerLink = infoLoggerLink(flpInfologgerLinkUrl, 'Infologger FLP');
    const epnInfologgerLink = infoLoggerLink(epnInfologgeLinkrUrl, 'Infologger EPN');

    const { environmentId, runNumber } = parameters;

    if (runNumber) {
        return identifierColumnAndActionsDropdown('run-detail', runNumber, parameters, [
            h(CopyToClipboardComponent, { value: runNumber, id: runNumber }, 'Copy Run Number'),
            flpInfologgerLink,
            epnInfologgerLink,
        ]);
    }

    if (environmentId) {
        return identifierColumnAndActionsDropdown('env-details', environmentId, parameters, [
            h(CopyToClipboardComponent, { value: environmentId, id: environmentId }, 'Copy Environment Id'),
            flpInfologgerLink,
            epnInfologgerLink,
        ]);
    }
};
