import { Observable } from "/js/src/index.js";

/**
 * Model representing handlers for homePage.js
 */
export default class Overview extends Observable {
  /**
   * @param {Object} model
   */
  constructor(model) {
    super();
    this.model = model;
    this.date = new Date().toDateString();
    this.data = [
      {
        authorID: "Batman",
        title: "Run1",
        creationTime: this.date,
        tags: ["Tag1", "Tag2"]
      }
    ];
    this.headers = ["ID", "Author ID", "Title", "Creation Time"];
  }
  /**
   * @returns Array []
   */
  getHeaders = () => {
    return this.headers;
  };

  getTableData = () => {
    const subentries = this.data.map(entry => {
      const filter = Object.keys(entry).map(subkey => {
        if (subkey !== "tags") {
          return entry[subkey];
        }
      });

      return filter;
    });

    return subentries;
  };
}
