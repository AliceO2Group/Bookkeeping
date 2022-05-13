import { h } from '/js/src/index.js';

/**
 * Css class to apply in order to enable the balloon (it will be hidden by default)
 * @type {string}
 */
const ENABLED_BALLOON_CLASS = 'enabled';

/**
 * Css class to apply in order to put the balloon on top of the actual content
 * @type {string}
 */
const TOP_POSITION_BALLOON_CLASS = 'anchor-top';

/**
 * Css class applied to the actual content of the balloon
 * @type {string}
 */
const ACTUAL_CONTENT_CLASS = 'balloon-actual-content';

/**
 * Utility to check if an element's content overflow
 *
 * Method is not perfect because offsetWidth and scrollWidth are rounded and CSS use float values to make the elipsis,
 * the element may actually have an ellipsis but this method return false in limit cases
 *
 * @param {HTMLElement} element the element to look for overflow
 * @returns {boolean} true if the element overflow
 */
const doesElementOverflow = (element) => Boolean(element) && element.offsetWidth < element.scrollWidth;

/**
 * Wrap a given vnode or string with a balloon displaying full content at hoover
 *
 * @param {Vnode} content the content to wrap with a balloon
 * @param {boolean} stretch if true, the balloon activation will be triggered on the container's hover
 * @returns {Vnode} the resulting vnode
 */
export const wrapWithBalloon = (content, stretch = true) => {
    let updateBalloonPosition;

    return h(`.balloon-container${stretch ? '.stretch' : ''}`, h('.balloon-sizer', [
        h(`.${ACTUAL_CONTENT_CLASS}.w-wrapped`, content),
        h('.balloon-anchor.anchor-top', {
            oncreate: (vnode) => {
                const element = vnode.dom;
                updateBalloonPosition = () => {
                    const actualContentElement = element.parentNode.querySelector(`.${ACTUAL_CONTENT_CLASS}`);
                    const balloonContainer = element.parentNode.parentNode;
                    if (doesElementOverflow(actualContentElement)) {
                        balloonContainer.classList.add(ENABLED_BALLOON_CLASS);
                    } else {
                        balloonContainer.classList.remove(ENABLED_BALLOON_CLASS);
                    }

                    const boundingClient = element.parentNode.getBoundingClientRect();

                    /*
                     * If the sizer is in the bottom half of the screen, display the balloon on top of the actual
                     * element
                     */
                    if (boundingClient.top + boundingClient.height / 2 > window.innerHeight / 2) {
                        element.classList.add();
                    } else {
                        // Else, display it at the bottom
                        element.classList.remove(TOP_POSITION_BALLOON_CLASS);
                    }
                };
                updateBalloonPosition();
                window.addEventListener('scroll', updateBalloonPosition);
                window.addEventListener('resize', updateBalloonPosition);
            },
            ondestroy: () => {
                window.removeEventListener('scroll', updateBalloonPosition);
                window.removeEventListener('resize', updateBalloonPosition);
            },
        }, h('.balloon.shadow-level1.p1.bg-white', content)),
    ]));
};
