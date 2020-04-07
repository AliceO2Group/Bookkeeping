/**
 * This file is part of the ALICE Electronic Logbook v2, also known as Jiskefet.
 * Copyright (C) 2020  Stichting Hogeschool van Amsterdam
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * function to add one path to another.
 * @param {string} basePath the base path that will be used to append on
 * @param {string} appendix the path that will be added on the base path
 * @param {Object} [options={}] options to be applied on the appending
 * @returns {string} the full appended path
 */
const appendPath = (basePath, appendix, options = {}) => {
    if (options.appendRule !== 'no-slash') {
        appendix = appendix.startsWith('/') ? appendix : '/'.concat(appendix);
    }

    return basePath.concat(appendix);
};

module.exports = appendPath;
