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
import { h, mount, Observable } from '/js/src/index.js';

/**
 * Mithril component that displays its content as child of custom dom elements (document's root by default) that can be out of the current
 * elements tree
 */
class Portal {
    /**
     * Component's constructor
     * @param {{attrs: {container: (HTMLElement|undefined)}}} props the component's properties
     */
    constructor({ attrs: { container } }) {
        // Container is the actual element that will be the parent of the portal's target
        this.container = container || document.body;
        // Because portal's target will be mounted on its own dom tree, it has its own model to trigger re-render when the portal is re-rendered
        this.model = new Observable();
    }

    // eslint-disable-next-line require-jsdoc
    oncreate({ children, text }) {
        /*
         * For simplicity, create a div that will serve as root for portal's target.
         * Doing so, it will be easier to clean it when portal is removed
         * If this div breaks tree, use `oncreate` and `onupdate` on children to use the target's actual dom element as rootNode
         * (this cannot work with text)
         */
        this.rootNode = document.createElement('div');
        this.container.append(this.rootNode);
        // Wrap children in a component to be able to update the mounted view function when portal is updated without changing mounting point
        this.content = {
            view: () => children || text,
        };
        mount(this.rootNode, this.content, this.model, false);
    }

    // eslint-disable-next-line require-jsdoc
    onupdate({ children, text }) {
        if (!this.content) {
            return;
        }
        // Update the view then notify, which will trigger a rendering of the new children
        this.content.view = () => children || text;
        this.model.notify();
    }

    // eslint-disable-next-line require-jsdoc
    onremove() {
        if (this.container.contains(this.rootNode)) {
            // Unmount the node in order for its lifecycle functions to be called
            mount(this.rootNode, () => null, false);
        }
        this.container.removeChild(this.rootNode);
    }

    // eslint-disable-next-line require-jsdoc
    view() {
        return null;
    }
}

/**
 * Create a portal to render a component outside its parent
 *
 * @param {Component} component the component to render
 * @param {Element} [container] the container in which component should be rendered (document's body by default)
 * @return {Component} the created portal that proxy the component
 */
export const createPortal = (component, container) => h(Portal, { container }, component);
