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

const { getTagsByText } = require('./getTagsByText.js');

/**
 * Extract all the tags corresponding to a list of tags text. If any of the text do not correspond to a tag, throw an error
 *
 * @param {string[]} [tagsTexts] the list of tags text
 * @return {Promise<SequelizeTag[]>} the list of tags
 */
const getAllTagsByTextOrFail = async (tagsTexts) => {
    if (!tagsTexts) {
        return [];
    }

    const tags = await getTagsByText(tagsTexts);

    const missingTags = tagsTexts.filter((text) => !tags.find((tag) => text === tag.text));
    if (missingTags.length > 0) {
        throw new Error(`Tags ${missingTags.join(', ')} could not be found`);
    }

    return tags;
};

exports.getAllTagsByTextOrFail = getAllTagsByTextOrFail;
