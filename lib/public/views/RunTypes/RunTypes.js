/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import RunTypeService from './RunTypesService.js';
import { Observable } from '/js/src/index.js';

/**
 * General run types model
 */
export default class RunTypes extends Observable {
    /**
     * Constructor for the run type class.
     * @param {model} model the overall model object.
     * @returns {void}
     */
    constructor(model) {
        super();
        this.model = model;

        this._runTypeService = new RunTypeService();
        this._runTypeService.bubbleTo(this);
    }

    /**
     * Loads the overview
     * @returns {void}
     */
    loadOverview() {
        this._runTypeService.fetchRunTypes();
    }

    /**
     * Getter for the run type service
     * @returns {RunTypeService} a run type service object.
     */
    get runTypeService() {
        return this._runTypeService;
    }
}
