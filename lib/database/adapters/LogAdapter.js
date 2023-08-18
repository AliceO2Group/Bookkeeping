/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

/**
 * LogAdapter
 */
class LogAdapter {
    /**
     * Constructor
     */
    constructor() {
        /**
         * @type {RunAdapter|null}
         */
        this.runAdapter = null;

        /**
         * @type {AttachmentAdapter|null}
         */
        this.attachmentAdapter = null;

        /**
         * @typedef {EnvironmentAdapter|null}
         */
        this.environmentAdapter = null;

        /**
         * @type {SubsystemAdapter|null}
         */
        this.subsystemAdapter = null;

        /**
         * @type {TagAdapter|null}
         */
        this.tagAdapter = null;

        /**
         * @type {LhcFillAdapter|null}
         */
        this.lhcFillAdapter = null;

        /**
         * @type {UserAdapter|null}
         */
        this.userAdapter = null;

        this.toEntity = this.toEntity.bind(this);
        this.toDatabase = this.toDatabase.bind(this);
    }

    /**
     * Converts the given database object to an entity object.
     *
     * @param {SequelizeLog} databaseObject Object to convert.
     * @returns {Log} Converted entity object.
     */
    toEntity(databaseObject) {
        const {
            id,
            title,
            text,
            user,
            createdAt,
            origin,
            subtype,
            rootLogId,
            parentLogId,
            replies,
            tags: sequelizeTags,
            runs,
            lhcFills: sequelizeLhcFills,
            subsystems: sequelizeSubsytems,
            attachments: sequelizeAttachments,
            environments: sequelizeEnvironments,
        } = databaseObject;

        const minifiedRuns = (runs || []).map(this.runAdapter.toMinifiedEntity);
        const tags = (sequelizeTags || []).map(this.tagAdapter.toEntity);
        const subsystems = (sequelizeSubsytems || []).map(this.subsystemAdapter.toEntity);
        const attachments = (sequelizeAttachments || []).map(this.attachmentAdapter.toEntity);
        const lhcFills = (sequelizeLhcFills || []).map(this.lhcFillAdapter.toEntity);
        const environments = (sequelizeEnvironments || []).map(this.environmentAdapter.toEntity);

        const entityObject = {
            id,
            title,
            text,
            author: this.userAdapter.toEntity(user),
            createdAt: new Date(createdAt).getTime(),
            origin,
            subtype,
            rootLogId: rootLogId || id,
            parentLogId: parentLogId || id,
            runs: minifiedRuns,
            tags,
            lhcFills,
            subsystems,
            attachments,
            environments,
        };

        if (replies) {
            entityObject.replies = replies;
        }

        return entityObject;
    }

    /**
     * Converts the given entity object to a database object.
     *
     * @param {Partial<Log>} entityObject Object to convert.
     * @returns {Partial<SequelizeLog>} Converted database object.
     */
    toDatabase(entityObject) {
        const databaseObject = {
            id: entityObject.id,
            userId: entityObject.userId,
            title: entityObject.title,
            text: entityObject.text,
            tags: entityObject.tags,
            lhcFillNumber: entityObject.lhcFills,
            environments: entityObject.environments,
            subtype: 'run',
            origin: 'process',
        };

        if (entityObject.rootLogId) {
            databaseObject.rootLogId = entityObject.rootLogId;
        }

        if (entityObject.parentLogId) {
            databaseObject.parentLogId = entityObject.parentLogId;
        }

        return databaseObject;
    }
}

module.exports = LogAdapter;
