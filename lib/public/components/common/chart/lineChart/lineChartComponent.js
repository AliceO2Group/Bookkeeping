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
import { renderLineChart } from './renderLineChart.js';

/**
 * @typedef LineChartComponentConfiguration
 * @property {LineChartConfiguration} [chartConfiguration] the line chart configuration
 * @property {Component} [placeholder="No data"] component rendered instead of the chart if points is empty
 */

/**
 * Component to display a chart
 */
class LineChartClassComponent {
    /**
     * Constructor
     * @param {{attrs: {points: T, configuration: LineChartComponentConfiguration}}} the component's vnode
     */
    constructor({ attrs: { points, configuration } }) {
        this.points = points;
        this.configuration = configuration;
    }

    /**
     * Render the chart in the given svg element
     *
     * @param {SVGElement} svgElement the svg in which chart will be displayed
     * @return {void}
     */
    render(svgElement) {
        renderLineChart(
            svgElement,
            this.points,
            this.configuration.chartConfiguration || {},
        );
    }

    /**
     * Returns the component's view
     *
     * @return {Component} the component's
     */
    view() {
        if (this.points.length === 0) {
            return h('.w-100.h-100.flex-row.items-center.justify-center', h('', this.configuration.placeholder || 'No data'));
        } else {
            return h('svg.w-100.h-100', {
                // eslint-disable-next-line require-jsdoc
                oncreate: (vnode) => {
                    this.render(vnode.dom);
                },
                // eslint-disable-next-line require-jsdoc
                onupdate: (vnode) => {
                    this.render(vnode.dom);
                },
            });
        }
    }
}

/**
 * Render a line chart component
 *
 * @param {Point} points the list of points coordinates to draw
 * @param {LineChartComponentConfiguration} configuration the configuration of the component
 * @return {Component} the resulting component
 */
export const lineChartComponent = (points, configuration) => h(
    LineChartClassComponent,
    { points, configuration },
);
