import { Observable } from '/js/src/index.js';

/**
 * Model class to store the preferences of the users
 */
export class UserPreferencesStore extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();

        this._rawTimestamps = false;
    }

    /**
     * States if timestamps must be displayed as raw timestamps or formatted as date
     *
     * @return {boolean} true if the timestamps must be displayed as is
     */
    get rawTimestamps() {
        return this._rawTimestamps;
    }

    /**
     * Set if the timestamp must be defined as raw timestamps or formatted as date
     *
     * @param {boolean} value the new preference
     */
    set rawTimestamps(value) {
        this._rawTimestamps = value;
    }
}

export const userPreferencesStore = new UserPreferencesStore();
