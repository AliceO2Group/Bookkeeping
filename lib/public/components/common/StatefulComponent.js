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
import { Observable } from '/js/src/index.js';

// No static property in es2020, using module encapsulation instead
let _renderer = null;

/**
 * Specific component that can triggers re-render on its own when its property changes
 *
 * Some components do not really require models, for example dropdowns. However, we need a way for these components to trigger re-render
 * without having to pass a model all the way along to it. This is the purpose of this component: calling their notify function will trigger
 * a re-render
 * At the application startup, a renderer should be provided in order for the component to trigger re-rendering
 */
export class StatefulComponent extends Observable {
    /**
     * Set the current renderer that the stateful components should notify when their state changed
     *
     * @param {{notify: function}} renderer the renderer to use
     * @return {void}
     */
    static useRenderer(renderer) {
        _renderer = renderer;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    notify() {
        super.notify();
        if (_renderer) {
            _renderer.notify();
        }
    }
}
