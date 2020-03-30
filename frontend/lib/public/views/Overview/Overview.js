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
        Tags: ["Tag1", "Tag2"]
      }
    ];
    this.headers = ["ID", "Author ID", "Title", "Creation Time", "Tags"];
  }
  /**
   * @returns Array []
   */
  getHeaders = () => {
    return this.headers;
  };

  getData = () => {
    return this.data;
  };
}
