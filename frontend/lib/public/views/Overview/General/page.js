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
import { h } from '/js/src/index.js';
import filters from '../../../components/Filters/index.js';
import { rowData, rowHeader } from '../../../components/Table/index.js';

export default model => [overviewScreen(model)];

/**
 * Table row header
 * @param {object} model
 * @return {vnode}
 */
const overviewScreen = model => {
    const headers = model.overview.getHeaders();
    const data = model.overview.getTableData();
    const tags = model.overview.getTagCounts();

    return h('.w-100.flex-row', [
        filters(model, tags),
        h('table.table.shadow-level1.mh3', [
            h('tr', [
                headers.map(header => {
                    return rowHeader(header);
                }),
            ]),
            data.map((entry, index) => {
                return h('tr', [
                    rowData(index + 1),
                    Object.keys(entry).map(subItem => {
                        return rowData(entry[subItem]);
                    }),
                ]);
            }),
        ]),
    ]);
};
