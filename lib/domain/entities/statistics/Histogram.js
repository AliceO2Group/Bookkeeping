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
 * @typedef HistogramBin
 * @property {number} offset the offset of the bin relative to the first bin
 * @property {number|number[]} count the amount of data in the bin
 */

/**
 * @typedef Histogram
 * @property {HistogramBin[]} bins the list of bins composing the histogram
 * @property {number} min the minimum value of the histogram's dataset
 * @property {number} max the maximum value of the histogram's dataset
 */
