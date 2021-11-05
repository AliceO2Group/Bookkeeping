/**
 * @license
 * Copyright CERN and copyright holders of ALICE Trg. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-Trg.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

 import { h } from '/js/src/index.js';

 const DATE_FORMAT = 'YYYY-MM-DD';
 
 let today = new Date();
 today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
 [today] = today.toISOString().split('T');
 
 /**
  * Returns the creation date filter components
  * @param {Object} model The global model object
  * @return {vnode} Two date selection boxes to control the minimum and maximum creation dates for the log filters
  */
 const trgEndFilter = (model) => {
     const trgfrom = model.runs.getTrgEndFilterFrom();
     const trgto = model.runs.getTrgEndFilterTo();
     return h('', [
         h('.f6', 'From:'),
         h('input.w-75.mv1', {
             type: 'date',
             id: 'TrgFilterFrom',
             placeholder: DATE_FORMAT,
             max: trgto || today,
             value: trgfrom,
             onchange: (e) => model.runs.setTrgEndFilter('From', e.target.value, e.target.validity.valid),
             oninput: (e) => model.runs.setTrgEndFilterWithDebounce('From', e.target.value, e.target.validity.valid),
         }, ''),
         h('.f6', 'To:'),
         h('input.w-75.mv1', {
             type: 'date',
             id: 'TrgEndFilterTo',
             placeholder: DATE_FORMAT,
             min: trgfrom,
             max: today,
             value: trgto,
             onchange: (e) => model.runs.setTrgEndFilter('To', e.target.value, e.target.validity.valid),
             oninput: (e) => model.runs.setTrgEndFilterWithDebounce('To', e.target.value, e.target.validity.valid),
         }, ''),
     ]);
 };
 
 export default trgEndFilter;
 