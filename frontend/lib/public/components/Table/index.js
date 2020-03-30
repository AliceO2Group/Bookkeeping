import { h } from "/js/src/index.js";

const rowHeader = header => [h("th", header)];
const rowData = data => [h("td", data)];

export { rowHeader, rowData };
