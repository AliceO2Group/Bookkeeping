import { h } from '/js/src/index.js';
import filters from '../../../components/Filters/index.js';
import { rowData, rowHeader } from '../../../components/Table/index.js';

export default model => [overviewScreen(model)];

const overviewScreen = model => {
  const headers = model.overview.getHeaders();
  const data = model.overview.getTableData();
  const tags = model.overview.getTagCounts();

  return h('.w-75.flex-row', [
    filters(tags),
    h('table.table.shadow-level1.mh3', [
      h('tr', [
        headers.map(header => {
          return rowHeader(header);
        })
      ]),
      data.map((entry, index) => {
        return h('tr', [
          rowData(index + 1),
          Object.keys(entry).map(subitem => {
            return rowData(entry[subitem]);
          })
        ]);
      })
    ])
  ]);
};
