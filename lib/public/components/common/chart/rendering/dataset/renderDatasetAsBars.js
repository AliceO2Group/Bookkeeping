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
 * @param {string[]} patternNames pattern name from @see BarPattern
 * @return {void}
 */
const addPatternsDefintionToSVG = (svg, patternNames) => {
    const defs = select(svg).append('defs');
    for (const patternName of patternNames) {
        if (patternName === BarPattern.DIAGONAL_STRIPES) {
            defs.append('pattern')
                .attr('id', 'diagonalStripes')
                .attr('width', 5)
                .attr('height', 5)
                .attr('patternUnits', 'userSpaceOnUse')
                .append('path')
                .attr('d', 'M 0,5 L 5,0')
                .attr('stroke', 'black')
                .attr('opacity', 0.5)
                .attr('stroke-width', 1);
        } else {
            throw new Error('Unsupported pattern');
        }
    }
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
    const { fill, stroke } = configuration;

    /**
     * Get bar fill
     * @param {Bar} bar a bar
     * @return {string} fill
     */
    const getFill = (bar) => bar.fill ?? fill ?? 'none';

    /**
     * Get bar stroke
     * @param {Bar} bar a bar
     * @return {string} stroke
     */
    const getStroke = (bar) => bar.stroke ?? stroke ?? 'none';

    const { getWidth, getHeight, getX, getY } = barPropertiesProvider;

    addPatternsDefintionToSVG(svg, bars.map(({ pattern }) => pattern).filter((i) =>i));

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
