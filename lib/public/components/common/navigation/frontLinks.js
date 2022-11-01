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
 * Return a list of links extracted for each item of a list
 *
 * @template T
 * @param {T[]|null} [items] the list of items for which links must be extracted
 * @param {frontLinkConfigurationExtractor<T>} configurationExtractor the function called on each item to extract the corresponding link
 *     configuration
 * @param {Object} [configuration] the front links configuration
 * @param {Component} [configuration.attributes] link's container attributes (if null, links and separators are returned as array and not
 *     encapsulated in a component), default to null
 * @param {Component} [configuration.separator] component displayed between each link, defaults to ", "
 * @param {Component} [configuration.empty] component displayed if items list is null or empty, default to "-"
 * @param {Component} [configuration.group] if true, each separator will be encapsulated in a component with the previous link, default to false
 * @return {Component} the resulting component
 */
export const frontLinks = (items, configurationExtractor, configuration) => {
    const { separator = ', ', empty = '-', attributes = null, group = false } = configuration || {};

    if (!items || items.length === 0) {
        return empty;
    }

    /** * @type {Component[]} */
    const linksWithSeparator = items.map((item) => {
        const { content, parameters, page, href, attributes } = configurationExtractor(item);
        return [
            page ? frontLink(content, page, parameters, attributes) : absoluteFrontLink(content, href, attributes),
            separator,
        ];
    });
    // Remove separator from last link
    const lastLinkWithSeparator = linksWithSeparator[linksWithSeparator.length - 1];
    lastLinkWithSeparator.pop();

    const content = group ? linksWithSeparator.map((linkWithSeparator) => h('span', linkWithSeparator)) : linksWithSeparator;

    return attributes ? h('', attributes, content) : content;
};

/**
 * Return a list of links extracted for each item of a list formatted for a display data cell
 *
 * @template T
 * @param {T[]|null} [items] the list of items for which links must be extracted
 * @param {frontLinkConfigurationExtractor<T>} configurationExtractor the function called on each item to extract the corresponding link
 *     configuration
 * @return {Component} the resulting component
 */
export const detailsFrontLinks = (items, configurationExtractor) => frontLinks(
    items,
    configurationExtractor,
    {
        empty: 'None',
        attributes: { class: 'flex-row flex-wrap gc2' },
        group: true,
    },
);
