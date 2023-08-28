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

import { select, axisLeft } from '/assets/d3.min.js';

/**
 * Render a vertical axis on the left of a given drawing zone
 *
 * @param {SVGElement} svg the SVG in which axis must be displayed
 * @param {function} yScale the d3 scale applied on the vertical axis
 * @param {BoundingBox} chartDrawingZone the chart's drawing zone
 * @return {void}
 */
export const renderVerticalAxis = (svg, yScale, chartDrawingZone) => {
    select(svg).append('g')
        .attr('transform', `translate(${chartDrawingZone.left},0)`)
        .call(axisLeft(yScale));
};
