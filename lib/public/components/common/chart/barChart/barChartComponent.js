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

import { h } from '/js/src/index.js';
import { BarChartRenderer } from '../rendering/BarChartRenderer.js';

/**
 * @typedef BarChartComponentConfiguration
 * @property {BarChartConfiguration} [chartConfiguration] the bar chart configuration
 * @property {Component} [placeholder="No data"] component rendered instead of the chart if points is empty
 */

/**
 * Component to display a histogram
 */
class BarChartClassComponent {
    /**
     * Constructor
     * @param {{attrs: {points: Point[], configuration: BarChartComponentConfiguration}}} vnode the component's vnode
     */
    constructor({
        attrs: {
            points,
            configuration,
        },
    }) {
        this._chartRenderer = new BarChartRenderer(configuration.chartConfiguration, points);
    }

    /**
     * Render the histogram in the given svg element
     *
     * @param {SVGElement} svgElement the svg in which chart will be displayed
     * @return {void}
     */
    render(svgElement) {
        this._chartRenderer.render(svgElement);
    }

    /**
     * Returns the component's view
     *
     * @return {Component} the component's
     */
    view() {
        return h('svg.w-100.h-100', {
            oncreate: (vnode) => {
                this.render(vnode.dom);
            },
            onupdate: (vnode) => {
                this.render(vnode.dom);
            },
        });
    }
}

/**
 * Render a line chart component
 *
 * @param {Point[]} points the points to display
 * @param {BarChartComponentConfiguration} configuration the configuration of the component
 * @return {Component} the resulting component
 */
export const barChartComponent = (points, configuration) => points.length
    ? h(BarChartClassComponent, { points, configuration })
    : h('.w-100.h-100.flex-row.items-center.justify-center', h('', configuration.placeholder || 'No data'));
