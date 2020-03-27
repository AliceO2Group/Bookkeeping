import { h } from "/js/src/index.js";

export default model => [dataTable(model)];

const dataTable = model => {
  const headers = model.overview.getHeaders();

  return h("table.table.shadow-level2", [
    h("tr", [
      headers.map(header => {
        return rowHeader(header);
      })
    ])
  ]);
};

const rowHeader = header => [h("th", header)];
