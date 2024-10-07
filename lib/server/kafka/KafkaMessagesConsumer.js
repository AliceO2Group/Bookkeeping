const { LogManager } = require('@aliceo2/web-ui');

/**
 * Generic Kafka Message consumer extracting objects according to a protobuf definition
 * @template T extends import('protobufjs').Type
 */
class KafkaMessagesConsumer {
    // eslint-disable-next-line valid-jsdoc
    /**
     * Constructor
     *
     * @param {import('kafkajs').Kafka} kafkaClient configured kafka client
     * @param {string} groupId the group id to use for the kafka consumer
     * @param {string[]} topics the list of topics to consume
     * @param {import('protobufjs').Type} protoType the type definition of the handled message
     */
    constructor(kafkaClient, groupId, topics, protoType) {
        this.consumer = kafkaClient.consumer({ groupId });
        this._topics = topics;
        this._protoType = protoType;

        /**
         * @type {MessageReceivedCallback[]}
         * @private
         */
        this._listeners = [];

        this._logger = LogManager.getLogger(this.getLoggerLabel());
    }

    /**
     * Register a listener to listen on event message being received
     *
     * Listeners are called all at once, not waiting for completion before calling the next ones, only errors are caught and logged
     *
     * @param {MessageReceivedCallback} listener the listener to register
     * @return {void}
     */
    onMessageReceived(listener) {
        this._listeners.push(listener);
    }

    /**
     * Start the kafka consumer
     *
     * @return {Promise<void>} Resolves once the consumer started to consume messages
     */
    async start() {
        this._logger.infoMessage(`Started to listen on kafka topic ${this._topics}`);
        await this.consumer.connect();
        await this.consumer.subscribe({ topics: this._topics });
        await this.consumer.run({
            eachMessage: async ({ message, topic }) => {
                const error = this._protoType.verify(message.value);
                if (error) {
                    this._logger.errorMessage(`Received an invalid message on "${topic}" ${error}`);
                    return;
                }
                this._logger.debugMessage(`Received message on ${topic}`);

                try {
                    await this._handleEvent(this._protoType.toObject(
                        this._protoType.decode(message.value),
                        { enums: String },
                    ));
                } catch (error) {
                    this._logger.errorMessage(`Failed to convert message to object on topic ${topic}: ${error}`);
                }
            },
        });
    }

    /**
     * Call every registered listeners by passing the given message to it
     *
     * @param {T} message the message to pass to listeners
     * @return {void}
     */
    async _handleEvent(message) {
        for (const listener of this._listeners) {
            try {
                await listener(message);
            } catch (error) {
                this._logger.errorMessage(`An error occurred when handling event: ${error.message}\n${error.stack}`);
            }
        }
    }

    /**
     * Return the label to be used by the logger
     *
     * @return {string} the logger label
     */
    getLoggerLabel() {
        return 'EVENT-CONSUMER';
    }
}

exports.KafkaMessagesConsumer = KafkaMessagesConsumer;
