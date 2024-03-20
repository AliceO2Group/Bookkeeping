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

/**
 * Render horizontal lines for every tick of an axis
 *
 * @param {d3.Selection} axis the d3 vertical axis
 * @param {number} chartWidth the width of the chart
 * @return {void}
 */
export const renderHorizontalGrid = (axis, chartWidth) => {
    axis.selectAll('.tick')
        .append('line')
        .attr('class', 'chart-grid')
        .attr('x2', chartWidth);
};
