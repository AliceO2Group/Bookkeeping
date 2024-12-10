import { Observable } from '/js/src/index.js';

/**
 * Model storing state for the home page
 */
export class ErrorModel extends Observable {
    /**
     * The constructor of the error model object
     */
    constructor() {
        super();
    }

    /**
     * Method to handle the not found page
     * @returns {void}
     */
    loadNotFound() {
        this.emit('notFound');
    }
}
