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

import { getInfologgerLinksUrls } from '../../../services/externalRouting/getInfologgerLinksUrls.js';
import { h } from '/js/src/index.js';

/**
 * Returns an infologger link component for the given infologger link url and label.
 *
 * @param {string} url The infologger url for the link.
 * @param {string} label The label for the link.
 * @return {Component} The infologger link component
 */
const infoLoggerLink = (url, label) => h('a', { href: url, target: '_blank' }, label);

/**
 * Returns an FLP infologger link component for the given infologger filter and label.
 *
 * @param {InfologgerUrlFilter} filter the filter to apply on infologger
 * @param {string} [label = 'FLP'] The label for the link.
 * @return {Component[]} the flp infologger link
 */
export const flpInfologgerLinkComponent = (filter, label = 'FLP') => {
    const { flp: flpInfologgerLinkUrl } = getInfologgerLinksUrls(filter);
    return flpInfologgerLinkUrl
        ? infoLoggerLink(flpInfologgerLinkUrl, label)
        : null;
};

/**
 * Returns an EPN infologger link component for the given infologger filter and label.
 *
 * @param {InfologgerUrlFilter} filter the filter to apply on infologger
 * @param {string} [label = 'EPN'] The label for the link.
 * @return {Component[]} the epn infologger link
 */
export const epnInfologgerLinkComponent = (filter, label = 'EPN') => {
    const { epn: epnInfologgerLinkUrl } = getInfologgerLinksUrls(filter);
    return epnInfologgerLinkUrl
        ? infoLoggerLink(epnInfologgerLinkUrl, label)
        : null;
};

/**
 * Display the links to infologger (FLP and EPN) with appropriate filters applied
 *
 * Depending on the configuration, links to only FLP, only EPN or none can also be returned
 *
 * @param {InfologgerUrlFilter} filter the filter to apply on infologger
 * @return {Component[]} the infologger links
 */
export const infologgerLinksComponents = (filter) => [
    flpInfologgerLinkComponent(filter, 'Infologger FLP'),
    epnInfologgerLinkComponent(filter, 'Infologger EPN'),
].filter((link) => link);
