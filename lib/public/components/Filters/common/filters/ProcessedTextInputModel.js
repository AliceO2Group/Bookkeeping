import { Observable } from '/js/src/index.js';

/**
 * Model to store raw and processed value of a form input
 *
 * @template T
 */
export class ProcessedTextInputModel extends Observable {
    /**
     * @callback parseCallback
     *
     * @param {string} raw the raw value
     * @return {T} the parsed value
     */

    /**
     * Constructor
     *
     * @param {object} [options] eventual options
     * @param {parseCallback} [options.parse] function called to extract new value from raw value. If function throws, new value will not be
     *     applied
     */
    constructor(options) {
        super();

        const { parse } = options || {};

        this._raw = '';
        this._value = null;

        this._parse = parse;

        this._visualChange$ = new Observable();
    }

    /**
     * Returns the raw value of the input
     *
     * @return {string} the raw value
     */
    get raw() {
        return this._raw;
    }

    /**
     * Returns the processed value of the input
     *
     * @return {T} the current value
     */
    get value() {
        return this._value;
    }

    /**
     * Update the raw value and eventually parse the new value from it
     *
     * @param {string} raw the new raw value
     * @param {boolean} parseValue if true, new raw value will be parsed to extract the new value (applied only if parse succeed)
     * @return {void}
     */
    update(raw, parseValue = false) {
        this._raw = raw;

        if (parseValue && this._parse) {
            try {
                const value = this._parse(raw);
                if (this._value !== value) {
                    this._value = value;
                    this.notify();
                    // Do not trigger visual change
                    return;
                }
            } catch (_) {
                // For now, simply ignore the new value if invalid
            }
        }

        this._visualChange$.notify();
    }

    /**
     * Resets the model to its initial state (without notification)
     *
     * @return {void}
     */
    reset() {
        this._raw = '';
        this._value = null;
    }

    /**
     * Return the visual change observable
     *
     * @return {Observable} the visual change observable
     */
    get visualChange$() {
        return this._visualChange$;
    }
}
