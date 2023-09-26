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

const AXIS_KEY_DATA_ATTRIBUTE = 'data-axis-key';

const DEFAULT_AXIS_GAP = 5;

const DEFAULT_AXIS_TICK_GAP = 5;

/**
 * @typedef AxisConfiguration
 * @property {string} label the axis label
 * @property {number} gap the space between the axis label and the ticks
 * @property {object} [ticks] the axis labels configuration
 * @property {number} [ticks.gap] the margin to leave between tick labels
 * @property {formatAxisTick} [ticks.format] function applied on tick's domain value to display tick
 */

/**
 * Renderer able to draw chart axis with label
 */
export class AxisRenderer {
    /**
     * Constructor
     *
     * @param {SVGElement} svg the svg in which the axis must be rendered
     * @param {string} key identifying the axis
     * @param {AxisConfiguration} [configuration] the configuration to apply on the axis
     */
    constructor(svg, key, configuration) {
        this.svg = svg;
        this.key = key;

        // Store the configuration, using default when it applies
        const { label, gap = DEFAULT_AXIS_GAP, ticks } = configuration || {};
        const { gap: ticksGap = DEFAULT_AXIS_TICK_GAP, format: tickFormat } = ticks || {};
        this.configuration = {
            label,
            gap,
            ticks: {
                gap: ticksGap,
                format: tickFormat,
            },
        };
    }

    /**
     * Render the axis for a given scale and around given chart drawing zone
     *
     * @param {function} scale the d3 scale applied on the axis
     * @param {BoundingBox} chartDrawingZone the chart drawing zone
     * @return {DOMRect} the bounding box of the axis
     */
    render(scale, chartDrawingZone) {
        const axis = this.cleanAndCreateAxis();
        // Need access to this in d3 functions that binds the svg element to `this`
        const renderer = this;

        // Line and ticks
        const lineAndTicksRenderer = this.getTicksAndLineRenderer(scale);
        const tickFormat = this.configuration.ticks.format;
        if (tickFormat) {
            lineAndTicksRenderer.tickFormat(tickFormat);
        }

        const ticksAndLinePosition = this.getTicksAndLinePosition(chartDrawingZone);
        axis.append('g')
            .call(lineAndTicksRenderer)
            .attr('transform', `translate(${ticksAndLinePosition.x}, ${ticksAndLinePosition.y})`);

        let tickCumulativeSize = 0;
        axis.selectAll('.tick').each(function () {
            tickCumulativeSize += renderer.getTicksRestrictedDimension(this.getBoundingClientRect()) + 2 * renderer.configuration.ticks.gap;
        });

        // Use a mean between all the labels width/height to estimate the amount of labels to drop
        const factor = Math.ceil(tickCumulativeSize / this.getTicksRestrictedDimension(chartDrawingZone));
        if (factor > 1) {
            axis.selectAll(`.tick:not(:nth-of-type(${factor}n-${factor - 1}))`).remove();
        }

        // Compute line and tick width and height to place the label
        let lineAndTickBoundingBox = DOMRect.fromRect();
        axis.call((svgGroup) => {
            lineAndTickBoundingBox = svgGroup.node().getBoundingClientRect();
        });

        // Label
        const labelPosition = this.getLabelPosition(lineAndTickBoundingBox, chartDrawingZone);
        const labelRotation = this.getLabelRotation();

        axis.append('text')
            .text(this.configuration.label)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', this.getLabelDominantBaseline())
            .attr('transform', `translate(${labelPosition.x}, ${labelPosition.y}), rotate(${labelRotation} 0 0)`);

        /** @type {DOMRect} */
        let ret = DOMRect.fromRect();
        axis.call((axis) => {
            ret = axis.node().getBoundingClientRect();
        });

        return ret;
    }

    /**
     * Returns a ticksAndLine renderer applied to a given scale
     * @param {d3.AxisScale} scale the scale used to compute ticks
     * @return {d3.Axis} the axis renderer
     * @abstract
     */
    getTicksAndLineRenderer(scale) {// eslint-disable-line no-unused-vars
        throw new Error('Abstract function call');
    }

    /**
     * Returns the tick and line position
     * @param {BoundingBox} chartDrawingZone the chart's drawing zone
     * @return {Coordinates} the position
     * @abstract
     */
    getTicksAndLinePosition(chartDrawingZone) {// eslint-disable-line no-unused-vars
        throw new Error('Abstract function call');
    }

    /**
     * Ticks are either restricted on width or on height, this function extract the only restricted dimension
     *
     * @param {{width: number, height: number}} dimensions the 2d dimensions
     * @return {number} the restricted dimension
     * @abstract
     */
    getTicksRestrictedDimension(dimensions) {// eslint-disable-line no-unused-vars
        throw new Error('Abstract function call');
    }

    /**
     * Compute and return the label's position
     *
     * @param {DOMRect} lineAndTicksBoundingBox the line and ticks bounding box
     * @param {BoundingBox} chartDrawingZone the chart drawing zone
     * @return {Coordinates} the label's coordinates
     * @abstract
     */
    getLabelPosition(lineAndTicksBoundingBox, chartDrawingZone) {// eslint-disable-line no-unused-vars
        throw new Error('Abstract function call');
    }

    /**
     * Return the dominant baseline to apply to label's text element
     *
     * @return {string} the dominant baseline
     * @abstract
     */
    getLabelDominantBaseline() {
        throw new Error('Abstract function call');
    }

    /**
     * Clean previously existing axis and draw the new ones
     *
     * @return {d3.Selection} the d3 selection for the created axis
     */
    cleanAndCreateAxis() {
        // ---- Remove eventual previous axis ----
        select(this.svg)
            .selectAll(`[${AXIS_KEY_DATA_ATTRIBUTE}=${this.key}]`)
            .remove();

        // ---- Render the new vertical axis ----
        return select(this.svg)
            .append('g')
            .attr(AXIS_KEY_DATA_ATTRIBUTE, this.key);
    }

    /**
     * Returns the rotation to apply to the label
     *
     * @return {number} the rotation to apply
     */
    getLabelRotation() {
        return 0;
    }

    /**
     * Return, if it applies, the current axis g element as d3 selection
     * @return {d3.Selection} the axis g
     */
    getCurrentAxis() {
        return select(this.svg)
            .selectAll(`[${AXIS_KEY_DATA_ATTRIBUTE}=${this.key}]`);
    }
}
