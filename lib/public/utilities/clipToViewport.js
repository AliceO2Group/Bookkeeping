/**
 * Clip an element to the current viewport
 *
 * For now, only relatively positioned elements are handled
 *
 * @param {HTMLElement} element the element to clip
 * @param {number} clipMargin the margin to leave between the element and the viewport
 *
 * @return {void}
 */
export const clipToViewport = (element, clipMargin = 0) => {
    element.style.removeProperty('left');
    element.style.removeProperty('right');
    element.style.removeProperty('width');

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const { width, height } = element.getBoundingClientRect();

    if (width + 2 * clipMargin > windowWidth) {
        // The element is larger than window, fix its width
        const maxWidth = windowWidth - 2 * clipMargin;
        element.style.setProperty('width', `${maxWidth}px`);
    }

    if (height + 2 * clipMargin > windowHeight) {
        // The element is higher than window, fix its height
        const maxHeight = windowHeight - 2 * clipMargin;
        element.style.setProperty('height', `${maxHeight}px`);
    }

    // Get the new position, if the element has been resized
    const { left, right, top, bottom } = element.getBoundingClientRect();

    if (left - clipMargin < 0) {
        element.style.setProperty('left', `${-left + clipMargin}px`);
    } else if (windowWidth < right + clipMargin) {
        element.style.setProperty('right', `${right - windowWidth + clipMargin}px`);
    }

    if (top - clipMargin < 0) {
        element.style.setProperty('top', `${-top + clipMargin}px`);
    } else if (windowHeight < bottom + clipMargin) {
        element.style.setProperty('bottom', `${bottom - windowWidth + clipMargin}px`);
    }
};
