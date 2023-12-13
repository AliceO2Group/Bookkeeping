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
 * @typedef BoundingBoxProjector
 *
 * Object able to project a bounding box 2D data to only one of its dimensions
 *
 * @template T
 *
 * @property {(subject: {left: T, top: T} | {x: T, y: T}) => T} getPosition return the position of the subject
 * @property {(subject: {left: T, top: T} | {x: T, y: T}, position: T) => void} setPosition set the position of the subject to a given value
 * @property {(subject: {width: T, height: T}) => t} getSize return the size of the subject
 * @property {(subject: {width: T, height: T}, size: T) => void} setSize set the size of the subject to a given value
 */

/**
 * @type BoundingBoxProjector
 */
const verticalProjector = Object.freeze({
    getPosition: (subject) => 'top' in subject ? subject.top : subject.y,

    setPosition: (subject, position) => {
        if ('top' in subject) {
            subject.top = position;
        } else {
            subject.y = position;
        }
    },

    getSize: (subject) => subject.height,

    setSize: (subject, size) => {
        subject.height = size;
    },
});

/**
 * @type BoundingBoxProjector
 */
const horizontalProjector = Object.freeze({
    getPosition: (subject) => 'left' in subject ? subject.left : subject.x,

    setPosition: (subject, position) => {
        if ('left' in subject) {
            subject.left = position;
        } else {
            subject.y = position;
        }
    },

    getSize: (subject) => subject.width,

    setSize: (subject, size) => {
        subject.width = size;
    },
});

/**
 * @typedef {number} PopoverAnchor
 */

/**
 * @typedef {number} MainAxisPopoverPosition
 */

/**
 * @typedef {number} CrossAxisPopoverPosition
 */

/**
 * Available popover position related to the trigger on main axis
 *
 * @type {{BEFORE: MainAxisPopoverPosition, AFTER: MainAxisPopoverPosition}}
 */
const MainAxisPositions = {
    BEFORE: 0, // Popover will be before the trigger on the main axis
    AFTER: 1, // Popover will be after the trigger on the main axis
};

/**
 * Available popover position related to the trigger on cross axis
 *
 * @type {{START: CrossAxisPopoverPosition, END: CrossAxisPopoverPosition, MIDDLE: CrossAxisPopoverPosition}}
 */
const CrossAxisPositions = {
    START: 0, // The start of the popover will be aligned with the start of the trigger on the cross axis
    MIDDLE: 1, // The popover will be centered against the trigger on the cross axis
    END: 2, // The end of the popover will be aligned with the end of the trigger on the cross axis
};

/**
 * @type {Object<string, PopoverAnchor>}
 *
 * Defines the position of the popover related to the trigger
 */
export const PopoverAnchors = {
    // Main axis vertical
    TOP_START: 0,
    TOP_MIDDLE: 1,
    TOP_END: 2,

    BOTTOM_START: 3,
    BOTTOM_MIDDLE: 4,
    BOTTOM_END: 5,

    // Main axis horizontal
    LEFT_START: 6,
    LEFT_MIDDLE: 7,
    LEFT_END: 8,

    RIGHT_START: 9,
    RIGHT_MIDDLE: 10,
    RIGHT_END: 11,
};

/**
 * Class to position and resize a popover element relatively to a trigger in a given display zone
 *
 * Popover position is done around 2 axis:
 *    - Main axis, which is the side where the popover will be placed. For example if the main axis is horizontal, the popover will either be
 *    on the right or on the left of the trigger
 *    - Cross axis, which is the other axis
 */
class PopoverEngine {
    /**
     * Constructor
     *
     * @param {HTMLElement} trigger the bounding box of the trigger
     * @param {HTMLElement} popover the bounding box of the popover
     * @param {BoundingBox} displayBoundingBox the bounding box of the display zone, representing the limits where the popover may be drawn
     * @param {x: number, y: number} displayZoneMargins the margins to apply at the edge of the display zone
     * @param {{main: MainAxisPopoverPosition, cross: CrossAxisPopoverPosition}} position the position of the popover relative to the trigger
     * @param {{main: BoundingBoxProjector, cross: BoundingBoxProjector}} projectors the axis projectors
     */
    constructor(
        trigger,
        popover,
        displayBoundingBox,
        displayZoneMargins,
        position,
        projectors,
    ) {
        this._popover = popover;

        this._triggerBoundingBox = trigger.getBoundingClientRect();
        this._popoverBoundingBox = popover.getBoundingClientRect();

        this._mainAxisPosition = position.main;
        this._crossAxisPosition = position.cross;

        this._mainAxisProjector = projectors.main;
        this._crossAxisProjector = projectors.cross;

        this._displayBoundingBox = displayBoundingBox;
        this._displayZoneMargins = displayZoneMargins;
    }

    /**
     * Fit the popover to the drawing zone then position it
     *
     * @return {void}
     */
    fitAndPosition() {
        this.resizeAlongMainAxis();
        this.resizeAlongCrossAxis();
        this.positionAlongMainAxis();
        this.positionAlongCrossAxis();
    }

    /**
     * Reset the popover to its default size and position
     *
     * @return {void}
     */
    reset() {
        this._popover.style.removeProperty('height');
        this._popover.style.removeProperty('width');
        this._popover.style.removeProperty('top');
        this._popover.style.removeProperty('left');
        this._popoverBoundingBox = this._popover.getBoundingClientRect();
    }

    /**
     * Resize the popover along the main axis to not overflow of the display bounding box
     *
     * @return {void}
     */
    resizeAlongMainAxis() {
        if (!this._doesFitBeforeAlongMainAxis && !this._doesFitAfterAlongMainAxis) {
            let mainAxisSize;

            /*
             * When setting `left`, `top`, `width` or `height` properties, values are rounded which may lead to consider the popover to overflow
             * when we set `width` or `height` then get the available space
             */
            const availableSpaceBefore = Math.floor(this._triggerStartMainAxis);
            const availableSpaceAfter = Math.floor(this._availableSpaceInMainAxis - this._triggerEndMainAxis);

            // Put where there is the most space
            if (availableSpaceBefore > availableSpaceAfter) {
                // More space before
                this._mainAxisPosition = MainAxisPositions.BEFORE;
                mainAxisSize = availableSpaceBefore;
            } else if (availableSpaceBefore < availableSpaceAfter) {
                // More space after
                this._mainAxisPosition = MainAxisPositions.AFTER;
                mainAxisSize = availableSpaceAfter;
            } else {
                // Same space
                mainAxisSize = availableSpaceBefore;
            }

            this._mainAxisProjector.setSize(this._popover.style, `${mainAxisSize}px`);

            this._refreshPopoverBoundingBox();
        }
    }

    /**
     * Resize the popover along the cross axis to not overflow of the display bounding box
     *
     * @return {void}
     */
    resizeAlongCrossAxis() {
        if (this._popoverSizeCrossAxis > this._availableSpaceInCrossAxis) {
            this._crossAxisProjector.setSize(this._popover.style, `${this._availableSpaceInCrossAxis}px`);

            this._refreshPopoverBoundingBox();
        }
    }

    /**
     * Position the popover along the main axis
     *
     * @return {void}
     */
    positionAlongMainAxis() {
        let mainAxisPosition;

        if (this._mainAxisPosition === MainAxisPositions.BEFORE && this._doesFitBeforeAlongMainAxis || !this._doesFitAfterAlongMainAxis) {
            mainAxisPosition = this._triggerStartMainAxis - this._popoverSizeMainAxis;
        } else {
            mainAxisPosition = this._triggerEndMainAxis;
        }

        // Popover is placed absolutely relatively to the document, and its position should be offset by the window scroll
        mainAxisPosition += this._mainAxisProjector.getPosition(this._offsets);

        this._mainAxisProjector.setPosition(this._popover.style, `${mainAxisPosition}px`);
    }

    /**
     * Position the popover along the cross axis
     *
     * @return {void}
     */
    positionAlongCrossAxis() {
        let targetStartCrossAxis;

        if (this._crossAxisPosition === CrossAxisPositions.START) {
            targetStartCrossAxis = this._triggerStartCrossAxis;
        } else if (this._crossAxisPosition === CrossAxisPositions.END) {
            targetStartCrossAxis = this._triggerStartCrossAxis + this._triggerSizeCrossAxis - this._popoverSizeCrossAxis;
        } else {
            targetStartCrossAxis = this._triggerStartCrossAxis + (this._triggerSizeCrossAxis - this._popoverSizeCrossAxis) / 2;
        }

        targetStartCrossAxis += this._crossAxisProjector.getPosition(this._offsets);

        const crossAxisPosition = Math.max(
            this._crossAxisProjector.getPosition(this._displayBoundingBox)
                + this._crossAxisProjector.getPosition(this._displayZoneMargins),
            Math.min(
                this._availableSpaceInCrossAxis - this._popoverSizeCrossAxis,
                targetStartCrossAxis,
            ),
        );
        this._crossAxisProjector.setPosition(this._popover.style, `${crossAxisPosition}px`);
    }

    /**
     * Refresh the popover bounding box
     *
     * @return {void}
     * @private
     */
    _refreshPopoverBoundingBox() {
        this._popoverBoundingBox = this._popover.getBoundingClientRect();
    }

    /**
     * Returns the total available space along the main axis
     *
     * @return {number} the available space
     * @private
     */
    get _availableSpaceInMainAxis() {
        return this._mainAxisProjector.getSize(this._displayBoundingBox)
            - this._mainAxisProjector.getPosition(this._displayZoneMargins);
    }

    /**
     * Returns the total available space along the cross axis
     *
     * @return {number} the available space
     * @private
     */
    get _availableSpaceInCrossAxis() {
        return this._crossAxisProjector.getSize(this._displayBoundingBox)
            - this._crossAxisProjector.getPosition(this._displayZoneMargins) * 2;
    }

    /**
     * Return the position of the start of the trigger along the main axis
     *
     * @return {number} the start position
     * @private
     */
    get _triggerStartMainAxis() {
        return this._mainAxisProjector.getPosition(this._triggerBoundingBox);
    }

    /**
     * Return the position of the end of the trigger along the main axis
     *
     * @return {number} the end position
     * @private
     */
    get _triggerEndMainAxis() {
        return this._triggerStartMainAxis + this._mainAxisProjector.getSize(this._triggerBoundingBox);
    }

    /**
     * Return the position of the trigger along the cross axis
     *
     * @return {number} the start position
     * @private
     */
    get _triggerStartCrossAxis() {
        return this._crossAxisProjector.getPosition(this._triggerBoundingBox);
    }

    /**
     * Return the size of the trigger along the cross axis
     *
     * @return {number} the size
     * @private
     */
    get _triggerSizeCrossAxis() {
        return this._crossAxisProjector.getSize(this._triggerBoundingBox);
    }

    /**
     * Return the size of the popover along the main axis
     *
     * @return {number} the size
     * @private
     */
    get _popoverSizeMainAxis() {
        return this._mainAxisProjector.getSize(this._popoverBoundingBox);
    }

    /**
     * Return the size of the popover along the cross axis
     *
     * @return {number} the size
     * @private
     */
    get _popoverSizeCrossAxis() {
        return this._crossAxisProjector.getSize(this._popoverBoundingBox);
    }

    /**
     * States if the popover can fit before the trigger along the main axis
     *
     * @return {boolean} true if it fits
     * @private
     */
    get _doesFitBeforeAlongMainAxis() {
        return this._triggerStartMainAxis >= this._popoverSizeMainAxis;
    }

    /**
     * States if the popover can fit after the trigger along the main axis
     *
     * @return {boolean} true if it fits
     * @private
     */
    get _doesFitAfterAlongMainAxis() {
        return this._availableSpaceInMainAxis - this._triggerEndMainAxis >= this._popoverSizeMainAxis;
    }

    /**
     * The popover is placed absolutely relatively to the document, and it should be offset by the window's scroll
     *
     * @return {{top: number, left: number}} the offsets
     * @private
     */
    get _offsets() {
        return { top: window.scrollY, left: window.scrollX };
    }
}

/**
 * Creates and return a new popover engine
 *
 * @param {HTMLElement} trigger the bounding box of the trigger
 * @param {HTMLElement} popover the bounding box of the popover
 * @param {BoundingBox} displayBoundingBox the bounding box of the display zone, representing the limits where the popover may be drawn
 * @param {x: number, y: number} displayZoneMargins the margins to apply at the edge of the display zone
 * @param {PopoverAnchor} anchor the anchor to place the popover
 * @return {PopoverEngine} the created popover engine
 */
export const createPopoverEngine = (trigger, popover, displayBoundingBox, displayZoneMargins, anchor) => {
    // Top and Bottom are the 6 first anchors
    const mainAxisProjector = anchor / 6 < 1 ? verticalProjector : horizontalProjector;
    const crossAxisProjector = anchor / 6 < 1 ? horizontalProjector : verticalProjector;

    // Top goes from 0 to 2 and Left goes from 6 to 8
    const mainAxisPosition = Math.floor(anchor / 3) % 2 === 0 ? MainAxisPositions.BEFORE : MainAxisPositions.AFTER;

    // Anchors are always START, MIDDLE, END, START, MIDDLE, END and so on
    const crossAxisPosition = [CrossAxisPositions.START, CrossAxisPositions.MIDDLE, CrossAxisPositions.END][anchor % 3];

    return new PopoverEngine(
        trigger,
        popover,
        displayBoundingBox,
        displayZoneMargins,
        { main: mainAxisPosition, cross: crossAxisPosition },
        { main: mainAxisProjector, cross: crossAxisProjector },
    );
};
