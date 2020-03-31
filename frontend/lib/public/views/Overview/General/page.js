import { h } from "/js/src/index.js";
import { rowData, rowHeader } from "../../../components/Table/index.js";
export default model => [dataTable(model)];

const dataTable = model => {
  const headers = model.overview.getHeaders();
  const data = model.overview.getTableData();
  return h("table.table.shadow-level2", [
    h("tr", [
      headers.map(header => {
        return rowHeader(header);
      })
    ]),
    data.map((entry, index) => {
      return h("tr", [
        rowData(index + 1),
        Object.keys(entry).map(subitem => {
          return rowData(entry[subitem]);
        })
      ]);
    })
  ]);
};
