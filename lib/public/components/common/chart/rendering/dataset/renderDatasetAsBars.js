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

export const BarPattern = {
    DIAGONAL_STRIPES: 'diagonalStripes',
};

/**
 * Add pattern defintion to SVG
 *
 * @param {SVGElement} svg svg element
 * @return {void}
 */
const addPatternsDefintionToSVG = (svg) => {
    const defs = select(svg).append('defs');
    defs.append('pattern')
        .attr('id', BarPattern.DIAGONAL_STRIPES)
        .attr('width', 5)
        .attr('height', 5)
        .attr('patternUnits', 'userSpaceOnUse')
        .append('path')
        .attr('d', 'M 0,5 L 5,0')
        .attr('stroke', 'black')
        .attr('opacity', 0.5)
        .attr('stroke-width', 1);
};

/**
 * @typedef BarGraphConfiguration
 * @property {string} [stroke] the stroke color of the bar
 * @property {string} [fill] the fill color of the bar
 */

/**
 * Render a list of bars as a bar graph
 *
 * @param {SVGElement} svg the svg in which graph must be rendered
 * @param {ChartBar[]} bars the bars to display
 * @param {ChartBarPropertiesProvider} barPropertiesProvider provider to compute the bars coordinates as well as width and height
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
     * @param {ChartBar} bar a bar
     * @return {string} fill
     */
    const getFill = (bar) => bar.fill ?? fill ?? 'none';

    /**
     * Get bar stroke
     * @param {ChartBar} bar a bar
     * @return {string} stroke
     */
    const getStroke = (bar) => bar.stroke ?? stroke ?? 'none';

    const { getWidth, getHeight, getX, getY } = barPropertiesProvider;

    const anyPattern = bars.map(({ pattern }) => pattern).filter((pattern) => pattern)?.length > 0;
    if (anyPattern) {
        addPatternsDefintionToSVG(svg);
    }

    select(svg)
        .append('g')
        .selectAll('rect')
        .data(bars)
        .enter()
        .append('g')
        .each(function (bar) {
            select(this).append('rect')
                .attr('width', getWidth)
                .attr('height', getHeight)
                .attr('x', getX)
                .attr('y', getY)
                .attr('fill', getFill)
                .attr('stroke', getStroke)
                .attr('opacity', bar.opacity ?? 'none');

            const { pattern } = bar;
            if (pattern) {
                select(this).append('rect')
                    .attr('width', getWidth)
                    .attr('height', getHeight)
                    .attr('x', getX)
                    .attr('y', getY)
                    .attr('fill', `url(#${pattern})`)
                    .attr('stroke', 'none');
            }
        });
};
