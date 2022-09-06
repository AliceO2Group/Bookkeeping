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

/* global HyperMD CompleteEmoji */

import { mount, sessionService } from '/js/src/index.js';
import view from './view.js';
import Model from './Model.js';

sessionService.loadAndHideParameters();
window.sessionService = sessionService;

// Start application
const model = new Model(HyperMD, window, document, CompleteEmoji);
const debug = true; // Shows when redraw is done
mount(document.body, view, model, debug);

// Expose model to interact with it the browser's console
window.model = model;
