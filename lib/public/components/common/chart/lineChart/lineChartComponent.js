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
import { LineChartRenderer } from '../rendering/LineChartRenderer.js';

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
     * @param {{attrs: {data: Point[], configuration: LineChartComponentConfiguration}}} the component's vnode
     */
    constructor({ attrs: { data, configuration } }) {
        this.configuration = configuration;
        this.tooltipElement = null;
        this.hoveredPointCoordinates = null;

        /**
         * @type {Point|null}
         */
        this.hoveredPointAbsolutePosition = null;

        this.updateHoveredPoint = this.updateHoveredPoint.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this._chartRenderer = new LineChartRenderer(configuration.chartConfiguration, data);
        this.svgNode = null;
    }

    // eslint-disable-next-line require-jsdoc
    oncreate() {
        window.addEventListener('mousemove', this.handleMouseMove);
    }

    // eslint-disable-next-line require-jsdoc
    onupdate({ attrs: { data, configuration } }) {
        this.configuration = configuration;

        this._chartRenderer = new LineChartRenderer(configuration.chartConfiguration, data);
    }

    // eslint-disable-next-line require-jsdoc
    onremove() {
        window.removeEventListener('mousemove', this.handleMouseMove);
    }

    /**
     * Handle the mouse-move event and display the point tooltip accordingly
     *
     * @param {MouseEvent} event the event to handle
     * @return {void}
     */
    handleMouseMove(event) {
        if (!this._svgNode) {
            return;
        }

        const { left, top } = this._svgNode.getBoundingClientRect();
        const relativeCursor = { x: event.clientX - left, y: event.clientY - top };

        if (!this._svgNode.parentNode.contains(event.target)) {
            this.updateHoveredPoint();
        } else {
            const { coordinates, relativePosition } = this._chartRenderer.getHoveredPoint(relativeCursor) || {};
            this.updateHoveredPoint(coordinates, relativePosition ? { x: relativePosition.x + left, y: relativePosition.y + top } : null);
        }
    }

    /**
     * Set the SVG element in which the chart will be rendered
     *
     * @param {SVGElement} svgNode the SVG node
     */
    set svgNode(svgNode) {
        this._svgNode = svgNode;
        this._render();
    }

    /**
     * Render the chart
     * @return {void}
     */
    _render() {
        if (this._svgNode) {
            this._chartRenderer.render(this._svgNode);
        }
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

                const { x, y } = this.hoveredPointAbsolutePosition;
                const { width, height } = this.tooltipElement.getBoundingClientRect();
                const { tooltipMargin = DEFAULT_TOOLTIP_MARGIN } = this.configuration;

                const left = Math.max(
                    0,
                    Math.min(
                        window.innerWidth - width,
                        x - width / 2,
                    ),
                );

                const top = y > height + tooltipMargin
                    ? y - height - tooltipMargin
                    : y + tooltipMargin;

                this.tooltipElement.style.left = `${left}px`;
                this.tooltipElement.style.top = `${top}px`;
            } else {
                this.tooltipElement.style.display = 'none';
            }
        }
    }

    /**
     * Update the currently hovered value
     *
     * @param {Point} [coordinates] the domain coordinates of the point being hovered
     * @param {Point} [absolutePosition] the absolute coordinates (relative to the page) of the point being hovered
     * @return {void}
     */
    updateHoveredPoint(coordinates, absolutePosition) {
        if (JSON.stringify(this.hoveredPointCoordinates) !== JSON.stringify(coordinates)) {
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
    }

    /**
     * Returns the component's view
     *
     * @return {Component} the component's
     */
    view() {
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
                    this.svgNode = vnode.dom;
                },
                // eslint-disable-next-line require-jsdoc
                onupdate: (vnode) => {
                    this.svgNode = vnode.dom;
                },
                ondelete: () => {
                    this.svgNode = null;
                },
            }),
        ];
    }
}

/**
 * Render a line chart component
 *
 * @param {Point[]} points the list of points coordinates to draw
 * @param {LineChartComponentConfiguration} configuration the configuration of the component
 * @return {Component} the resulting component
 */
export const lineChartComponent = (points, configuration) => points.length
    ? h(LineChartClassComponent, { data: points, configuration })
    : h('.w-100.h-100.flex-row.items-center.justify-center', h('', configuration.placeholder || 'No data'));
