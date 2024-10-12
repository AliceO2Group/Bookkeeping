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
 * Render a list of bars as a bar graph
 *
 * @param {SVGElement} svg the svg in which graph must be rendered
 * @param {Bar[]} bars the bars to display
 * @param {BarPropertiesProvider} barPropertiesProvider provider to compute the bars coordinates as well as wight and thickness
 * @param {BarGraphConfiguration} [configuration] the bar graph configuration
 * @return {void}
 */
export const renderDatasetAsBars = (
    svg,
    bars,
    barPropertiesProvider,
    configuration,
) => {
    const { fill, stroke, pattern } = configuration;

    /**
     * Get bar fill
     * @param {Bar} bar a bar
     * @return {string} fill
     */
    const getFill = (bar) => barPropertiesProvider.getFill(bar) ?? fill ?? 'none';

    /**
     * Get bar stroke
     * @param {Bar} bar a bar
     * @return {string} stroke
     */
    const getStroke = (bar) => barPropertiesProvider.getStroke(bar) ?? stroke ?? 'none';

    const { getWidth, getHeight, getX, getY } = barPropertiesProvider;

    // // Define the pattern in the <defs> section
    const defs = select(svg).append('defs');
    defs.append('pattern')
        .attr('id', 'diagonalStripes') // Give the pattern an ID
        .attr('width', 10) // Width of the pattern
        .attr('height', 10) // Height of the pattern
        .attr('patternUnits', 'userSpaceOnUse') // Makes the pattern scalable
        .append('path') // Define the pattern content
        .attr('d', 'M 0,10 L 10,0') // Diagonal stripe
        .attr('stroke', 'red')
        .attr('stroke-width', 2);

    // select(svg)
    //     .append('g')
    //     .selectAll('rect')
    //     .data(bars)
    //     .join('rect')
    //     .attr('width', getWidth)
    //     .attr('height', getHeight)
    //     .attr('x', getX)
    //     .attr('y', getY)
    //     .attr('fill', getFill)
    //     .attr('stroke', getStroke);

    select(svg)
        .append('g')
        .selectAll('rect')
        .data(bars)
        .enter()
        .append('g')
        .each(function (d) {
            select(this).append('rect')
                .attr('width', getWidth)
                .attr('height', getHeight)
                .attr('x', getX)
                .attr('y', getY)
                .attr('fill', getFill)
                .attr('stroke', getStroke);

            if (d.pattern) {
                select(this).append('rect')
                    .attr('width', getWidth)
                    .attr('height', getHeight)
                    .attr('x', getX)
                    .attr('y', getY)
                    .attr('fill', 'url(#diagonalStripes)')
                    .attr('stroke', 'none');
            }
        });
};
