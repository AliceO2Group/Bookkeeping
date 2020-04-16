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
 * @param {string} basePath The base path that will be used to append on.
 * @param {string} appendix The path that will be added on the base path.
 * @param {Object} [options={base: 'trim', appendix: 'trim'}] Options to be applied on the appending.
 *                                                            Options are: 'trim' or 'exact'
 * @returns {string} the full appended path
 */
const appendPath = (basePath, appendix, options = { base: 'trim', appendix: 'trim' }) => {
    let preparedBasePath = (typeof (basePath) === 'string') ? basePath : '';
    let preparedAppendix = (typeof (appendix) === 'string') ? appendix : '';

    options.base = options.base || 'trim';
    options.appendix = options.appendix ||'trim';

    if (options.base == 'exact' && options.appendix == 'exact') {
        return preparedBasePath.concat(preparedAppendix);
    } else {
        if (options.base == 'exact');
        else {
            preparedBasePath = preparedBasePath.match(/([^/].*[^/])/g);
        }
        if (options.appendix == 'exact');
        else {
            preparedAppendix = preparedAppendix.match(/([^/].*[^/])/g);
        }

        return [preparedBasePath, preparedAppendix].join('/');
    }
};

module.exports = appendPath;
