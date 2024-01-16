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
 * Class to schedule processes execution
 */
class ScheduledProcessesManager {
    /**
     * Constructor
     */
    constructor() {
        this._intervals = [];
        this._timeouts = [];
    }

    /**
     * Schedule a callback
     *
     * @param {function} callback the callback to schedule
     * @param {object} [configuration] the scheduling configuration
     * @param {number} [configuration.every] if specified, defines the amount of time (in ms) that should elapse between callback calls. If not
     *     specified (and only if not specified), the callback will be called only once
     * @param {number} [configuration.wait] if specified, defines the amount of time (in ms) to wait before calling the callback. If not
     *     specified, callback will be called at scheduling
     * @return {void}
     */
    schedule(callback, configuration) {
        const { every = null, wait = 0 } = configuration || {};

        const scheduler = this;

        const recurrentCallback = every ? () => {
            scheduler._intervals.push(setInterval(callback, every));
            callback();
        } : callback;

        if (wait) {
            this._timeouts.push(setTimeout(recurrentCallback, wait));
        } else {
            recurrentCallback();
        }
    }

    /**
     * Clear all the scheduled processes
     *
     * @return {void}
     */
    cleanup() {
        for (const timeout of this._timeouts) {
            clearTimeout(timeout);
        }

        for (const interval of this._intervals) {
            clearInterval(interval);
        }
    }
}

exports.ScheduledProcessesManager = ScheduledProcessesManager;
