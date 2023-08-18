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
import { createPortal } from '../../../../utilities/createPortal.js';
import { renderLineChart } from './renderLineChart.js';

const DEFAULT_TOOLTIP_MARGIN = 20;

/**
 * @callback tooltipCallback
 * @param {Point} coordinates the coordinates of the point the tooltip refers to
 * @return {Component} the tooltip component
 */

/**
 * @typedef LineChartComponentConfiguration
 * @property {number} [tooltipMargin] margin between the hovered point and the tooltip
 * @property {tooltipCallback} [tooltip] function called to render the tooltip displayed when hovering a point on the graph
 * @property {function} [onPointHover] function called when a point is hovered
 * @property {LineChartConfiguration} [chartConfiguration] the line chart configuration
 * @property {Component} [placeholder="No data"] component rendered instead of the chart if points is empty
 */

/**
 * Component to display a chart
 */
class LineChartClassComponent {
    /**
     * Constructor
     * @param {{attrs: {points: Point, configuration: LineChartComponentConfiguration, notify: function}}} the component's vnode
     */
    constructor({ attrs: { points, configuration, notify } }) {
        this.points = points;
        this.configuration = configuration;
        this.notify = notify;
        this.tooltipElement = null;
        this.hoveredPointCoordinates = null;
        this.hoveredPointAbsolutePosition = null;
    }

    /**
     * Render the chart in the given svg element
     *
     * @param {SVGElement} svgElement the svg in which chart will be displayed
     * @return {void}
     */
    render(svgElement) {
        /**
         * Update the currently hovered value
         *
         * @param {Point} coordinates the domain coordinates of the point being hovered
         * @param {number[]} absolutePosition the absolute coordinates (relative to the page) of the point being hovered
         * @return {void}
         */
        const updateHoveredPoint = (coordinates, absolutePosition) => {
            if (this.hoveredPointCoordinates !== coordinates) {
                if (coordinates === undefined) {
                    this.hoveredPointAbsolutePosition = null;
                } else {
                    this.hoveredPointAbsolutePosition = absolutePosition;
                }

                this.hoveredPointCoordinates = coordinates;

                if (this.configuration.onPointHover) {
                    this.configuration.onPointHover();
                }
            }
        };

        renderLineChart(
            svgElement,
            this.points,
            updateHoveredPoint,
            this.configuration.chartConfiguration || {},
        );
    }

    /**
     * Update the tooltip position
     *
     * @return {void}
     */
    updateTooltip() {
        if (this.tooltipElement) {
            if (this.hoveredPointAbsolutePosition) {
                this.tooltipElement.style.display = 'inherit';

                const [pointX, pointY] = this.hoveredPointAbsolutePosition;
                const { width, height } = this.tooltipElement.getBoundingClientRect();
                const { tooltipMargin = DEFAULT_TOOLTIP_MARGIN } = this.configuration;

                const left = Math.max(
                    0,
                    Math.min(
                        window.innerWidth - width,
                        pointX - width / 2,
                    ),
                );

                const top = pointY > height + tooltipMargin
                    ? pointY - height - tooltipMargin
                    : pointY + tooltipMargin;

                this.tooltipElement.style.left = `${left}px`;
                this.tooltipElement.style.top = `${top}px`;
            } else {
                this.tooltipElement.style.display = 'none';
            }
        }
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
            return [
                createPortal(h(
                    '.chart-tooltip.shadow-level2.br3',
                    {
                        oncreate: ({ dom }) => {
                            this.tooltipElement = dom;
                            this.updateTooltip();
                        },
                        onupdate: ({ dom }) => {
                            this.tooltipElement = dom;
                            this.updateTooltip();
                        },
                        onremove: () => {
                            this.tooltipElement = null;
                        },
                    },
                    this.hoveredPointCoordinates ? this.configuration.tooltip(this.hoveredPointCoordinates) : null,
                )),
                h('svg.w-100.h-100', {
                    // eslint-disable-next-line require-jsdoc
                    oncreate: (vnode) => {
                        this.render(vnode.dom);
                    },
                    // eslint-disable-next-line require-jsdoc
                    onupdate: (vnode) => {
                        this.render(vnode.dom);
                    },
                }),
            ];
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
