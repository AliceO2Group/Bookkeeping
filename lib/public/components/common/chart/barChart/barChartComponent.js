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
import { createPortal } from '../../../../utilities/createPortal.js';

const DEFAULT_TOOLTIP_MARGIN = 20;

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
        this.configuration = configuration;
        this._chartRenderer = new BarChartRenderer(configuration.chartConfiguration, points);
        this.tooltipElement = null;
        this.hoveredPointCoordinates = null;

        /**
         * @type {Point|null}
         */
        this.hoveredPointAbsolutePosition = null;

        this.updateHoveredPoint = this.updateHoveredPoint.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);

        this._svgNode = null;
    }

    // eslint-disable-next-line require-jsdoc
    oncreate() {
        window.addEventListener('mousemove', this.handleMouseMove);
    }

    // eslint-disable-next-line require-jsdoc
    onremove() {
        window.removeEventListener('mousemove', this.handleMouseMove);
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
            const { coordinates, relativePosition } = this._chartRenderer.getHoveredBar(relativeCursor) || {};
            this.updateHoveredPoint(coordinates, relativePosition ? { x: relativePosition.x + left, y: relativePosition.y + top } : null);
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
                    this._svgNode = vnode.dom;
                    this.render(vnode.dom);
                },
                // eslint-disable-next-line require-jsdoc
                onupdate: (vnode) => {
                    this._svgNode = vnode.dom;
                    this.render(vnode.dom);
                },
            }),
        ];
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
