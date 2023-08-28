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

import { select, axisBottom } from '/assets/d3.min.js';

/**
 * @typedef AxisConfiguration
 * @property {object} [labels] the axis labels configuration
 * @property {number} labels.margin the margin to leave between axis labels
 */

const DEFAULT_AXIS_LABEL_MARGIN = 5;

/**
 * Render a horizontal axis bellow a given chart drawing zone
 *
 * @param {SVGElement} svg the svg in which the axis must be rendered
 * @param {function} xScale the d3 scale applied on the horizontal axis
 * @param {BoundingBox} chartDrawingZone the chart drawing zone
 * @param {AxisConfiguration} [axisConfiguration] the configuration to apply on the horizontal axis
 * @return {void}
 */
export const renderHorizontalAxis = (svg, xScale, chartDrawingZone, { labels = {} } = {}) => {
    const { margin: labelsMargin = DEFAULT_AXIS_LABEL_MARGIN } = labels;

    const xAxis = select(svg)
        .append('g')
        .attr('transform', `translate(0, ${chartDrawingZone.top + chartDrawingZone.height})`)
        .call(axisBottom(xScale));

    let tickCumulativeWidth = 0;
    xAxis.selectAll('.tick')
        .each(function () {
            tickCumulativeWidth += this.getBoundingClientRect().width + 2 * labelsMargin;
        });

    // Use a mean between all the labels width to estimate the amount of labels to drop
    const factor = Math.ceil(tickCumulativeWidth / chartDrawingZone.width);
    if (factor > 1) {
        xAxis.selectAll(`.tick:not(:nth-of-type(${factor}n-${factor - 1}))`)
            .remove();
    }
};
