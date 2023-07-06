import { Observable, RemoteData } from '/js/src/index.js';

/**
 * Model to handle tab-based panel state
 */
export class TabbedPanelModel extends Observable {
    /**
     * Constructor
     * @param {string[]} panelKeys the list of available panel keys, the first one will be used as default/fallback
     */
    constructor(panelKeys) {
        super();

        if (panelKeys.length === 0) {
            throw new Error('At least one panel key must be provided');
        }
        this._availablePanelKeys = panelKeys;

        this._currentPanelKey = null;
        this._currentPanelData = RemoteData.notAsked();
    }

    /**
     * Returns the current panel key
     *
     * @return {string} the panel key
     */
    get currentPanelKey() {
        return this._currentPanelKey || this.defaultPanelKey;
    }

    /**
     * Defines the current panel key
     *
     * @param {string|null} panelKey the new panel key
     */
    set currentPanelKey(panelKey) {
        const checkedPanelKey = this._availablePanelKeys.includes(panelKey) ? panelKey : this.defaultPanelKey;
        if (checkedPanelKey !== this._currentPanelKey) {
            this._currentPanelKey = checkedPanelKey;
            this._fetchCurrentPanelData();
        }
    }

    /**
     * Returns the remote data for the current panel
     *
     * @return {RemoteData} the current panel data
     */
    get currentPanelData() {
        return this._currentPanelData;
    }

    /**
     * Defines the current panel key
     *
     * @param {RemoteData} currentPanelData the current panel key
     */
    set currentPanelData(currentPanelData) {
        this._currentPanelData = currentPanelData;
    }

    /**
     * Returns the default (and fallback) panel key
     *
     * @return {string} the panel key
     */
    get defaultPanelKey() {
        return this._availablePanelKeys[0];
    }

    /**
     * Fetch the data for the current panel
     *
     * @return {void}
     * @private
     */
    _fetchCurrentPanelData() {
        // Override this in sub-models
    }
}
