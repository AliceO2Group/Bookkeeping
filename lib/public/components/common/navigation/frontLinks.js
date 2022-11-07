/*
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

/**
 * @typedef LinkConfiguration
 * @property {Component} [content] the content of the link to display
 * @property {string} [page] the page to which link points to
 * @property {Object} [parameters] the parameters of the url, alongside with the page (ignored if page is NOT provided)
 * @property {string} [href] the complete href of the link (will be ignored if page is provided)
 * @property {Object} [attributes] the list of attributes to add to the rendered link
 */

/**
 * @callback frontLinkConfigurationExtractor
 * @template T
 * @param {T} item
 * @return {LinkConfiguration} the link configuration
 */

import { frontLink } from './frontLink.js';
import { h } from '/js/src/index.js';
import { absoluteFrontLink } from './absoluteFrontLink.js';

/**
 * @typedef FrontLinksConfiguration
 * @property {Object} [attributes=null] link's container attributes (if null, links and separators are returned as array and not
 *     encapsulated in a component), default to null
 * @property {Component} [separator=', '] component displayed between each link
 * @property {Component} [empty='-'] component displayed if items list is null or empty
 * @property {boolean} [group=false] if true, each separator will be encapsulated in a component with the previous link
 * @property {boolean} [bypassRouter=false] if true AND page is not specified, links will be static links that are not handled by
 *     the router
 */

/**
 * Return a list of links extracted for each item of a list
 *
 * @template T
 * @param {T[]|null} [items] the list of items for which links must be extracted
 * @param {frontLinkConfigurationExtractor<T>} configurationExtractor the function called on each item to extract the corresponding link
 *     configuration
 * @param {Object} [configuration] the front links configuration
 * @return {Component} the resulting component
 */
export const frontLinks = (items, configurationExtractor, configuration) => {
    const { separator = ', ', empty = '-', attributes = null, group = false, bypassRouter } = configuration || {};

    if (!items || items.length === 0) {
        return empty;
    }

    /** * @type {Component[]} */
    const linksWithSeparator = items.map((item) => {
        const { content, parameters, page, href, attributes } = configurationExtractor(item);

        let link;
        if (page) {
            link = frontLink(content, page, parameters, attributes);
        } else if (bypassRouter) {
            link = h('a', { ...attributes, href }, content);
        } else {
            link = absoluteFrontLink(content, href, attributes);
        }

        return [link, separator];
    });
    // Remove separator from last link
    const lastLinkWithSeparator = linksWithSeparator[linksWithSeparator.length - 1];
    lastLinkWithSeparator.pop();

    const content = group ? linksWithSeparator.map((linkWithSeparator) => h('span', linkWithSeparator)) : linksWithSeparator;

    return attributes ? h('', attributes, content) : content;
};

/**
 * Wrapper around {@see frontLinks} with default configuration adapted to display a list of details
 *
 * @template T
 * @param {T[]|null} [items] the list of items for which links must be extracted
 * @param {frontLinkConfigurationExtractor<T>} configurationExtractor the function called on each item to extract the corresponding link
 *     configuration
 * @param {FrontLinksConfiguration} configuration the front links configuration
 * @return {Component} the resulting component
 */
export const detailsFrontLinks = (items, configurationExtractor, configuration) => frontLinks(
    items,
    configurationExtractor,
    {
        empty: 'None',
        attributes: { class: 'flex-row flex-wrap gc2' },
        group: true,
        ...configuration,
    },
);
