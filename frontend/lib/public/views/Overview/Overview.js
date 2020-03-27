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
    this.data = {};
    this.headers = ["ID", "Author ID", "Title", "Creation Time", "Tags"];
  }
  /**
   * @returns Array []
   */
  getHeaders() {
    return this.headers;
  }
}
