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
import { h } from '/js/src/index.js';

/**
 * A singular post which is part of a log
 * @param {Object} post all data related to the post
 * @param {Number} index the identification index of the post
 * @return {vnode} Returns the navbar
 */
const entry = (post, index) =>
    h('.flex-column.p2.shadow-level1.mv2', {
        id: `post${index}`,
    }, [
        h('.f7.gray-darker', { style: 'align-self: flex-end;' }, `#${index}`),
        h('.w-100.bg-gray-light.mv1.ph1#post-content', post.content),
        h('.w-75.mv1.ph1', `Written by: ${post.sender}`),
    ]);

export default entry;
