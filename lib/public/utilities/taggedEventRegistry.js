/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

/**
 * Registry to handle tagged events
 * This system allow to
 *      - add tags on some events at one point of the bubbling
 *      - listen to events that DO not have a given tags
 *
 * In order to work, an event listener must flush the registry in the last handler of the bubbling list
 */
class TaggedEventRegistry {
    /**
     * Constructor
     */
    constructor() {
        this._listenersExceptTagged = new Map();
        this._eventTagsMap = new Map();
    }

    /**
     * Add a listener that will be triggered when registry is flushed with an event that contains NONE of the given tags
     * To avoid memory leaks, do not forget to unregister the listener when needed
     *
     * @param {function} listener the listener to call if none of the tags is applied to the event
     * @param {...string[]} tags the list of tags that the event must NOT have to trigger listener
     *
     * @return {void}
     */
    addListenerForAnyExceptTagged(listener, ...tags) {
        const unifiedTags = [
            ...tags,
            ...this._listenersExceptTagged.get(listener) || [],
        ];
        this._listenersExceptTagged.set(listener, unifiedTags);
    }

    /**
     * Remove the given listener from the notification list (it will NEVER be called anymore)
     * The given function must be the same reference that the one passed to {@see addListenerForAnyExceptTagged}
     *
     * @param {function} listener the listener for which restriction must be edited
     *
     * @return {void}
     */
    removeListener(listener) {
        this._listenersExceptTagged.delete(listener);
    }

    /**
     * Add a tag to a given event
     *
     * @param {Event} e the event to tag
     * @param {string} tag the tag to add
     *
     * @return {void}
     */
    tagEvent(e, tag) {
        if (!this._eventTagsMap.has(e)) {
            this._eventTagsMap.set(e, []);
        }
        this._eventTagsMap.get(e).push(tag);
    }

    /**
     * Call all the registered listeners for which the given event's tags match the restrictions
     *
     * @param {Event} e the event to listen to
     *
     * @return {void}
     */
    flush(e) {
        const eventTags = this._eventTagsMap.get(e) || [];
        this._listenersExceptTagged.forEach((tags, listener) => {
            if (!tags.some((tag) => eventTags.includes(tag))) {
                listener(e);
            }
        });
        this._eventTagsMap = new Map();
    }
}

export const taggedEventRegistry = new TaggedEventRegistry();
