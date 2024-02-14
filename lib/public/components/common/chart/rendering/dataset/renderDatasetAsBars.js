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

import { select } from '/assets/d3.min.js';

/**
 * @typedef BarGraphConfiguration
 * @property {string} [stroke] the stroke color of the bar
 * @property {string} [fill] the fill color of the bar
 */

/**
 * Render a list of points as a line graph (eventually filled)
 *
 * @param {SVGElement} svg the svg in which graph must be rendered
 * @param {Bar[]} bars the points to display
 * @param {BarPropertiesProvider} barPropertiesProvider locator to compute the points coordinates
 * @param {BarGraphConfiguration} [configuration] the bar graph configuration
 * @return {void}
 */
export const renderDatasetAsBars = (
    svg,
    bars,
    barPropertiesProvider,
    configuration,
) => {
    const { fill, stroke } = configuration;

    /**
     * Get bar fill
     * @param {Point} point point
     * @return {string} fill
     */
    const getFill = (point) => barPropertiesProvider.getFill(point) ?? fill ?? 'none';

    /**
     * Get bar stroke
     * @param {Point} point point
     * @return {string} stroke
     */
    const getStroke = (point) => barPropertiesProvider.getStroke(point) ?? stroke ?? 'none';

    const { getWidth, getHeight, getX, getY } = barPropertiesProvider;

    select(svg)
        .append('g')
        .selectAll('rect')
        .data(bars)
        .join('rect')
        .attr('width', getWidth)
        .attr('height', getHeight)
        .attr('x', getX)
        .attr('y', getY)
        .attr('fill', getFill)
        .attr('stroke', getStroke);
};
