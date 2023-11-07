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

const { CONFIGURATION: { ALI_FLP_INDEX_URL } } = window;

/**
 * @typdef LinkWithText
 *
 * @property {String} name
 * @property {String} href
 */

/**
 * Serve ali flp references configuration fetched from server
 * @returns {Object} configuration
 * @returns {LinkWithText} [res.main] describe reference to main/home ali flp page
 * @returns {undefined|LinkWithText[]} [res.other] desribed references to other related pages
 */
export const getAliFlpReferencesConfiguration = () => ({
    aliFlpIndexUrl: ALI_FLP_INDEX_URL,
});
