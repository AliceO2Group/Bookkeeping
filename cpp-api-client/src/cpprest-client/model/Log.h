/**
 * ALICE Bookkeeping
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 0.0.0
 *
 * NOTE: This class is auto generated by OpenAPI-Generator 5.4.0.
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/*
 * Log.h
 *
 * Describes an intervention or an event that happened.
 */

#ifndef ORG_OPENAPITOOLS_CLIENT_MODEL_Log_H_
#define ORG_OPENAPITOOLS_CLIENT_MODEL_Log_H_


#include "ModelBase.h"

#include "model/User.h"
#include "model/Attachment.h"
#include "model/LogOrigin.h"
#include "model/Tag.h"
#include "model/LogSubtype.h"
#include "model/Subsystem.h"
#include <cpprest/details/basic_types.h>
#include <vector>
#include "model/Log_runs.h"

namespace org {
namespace openapitools {
namespace client {
namespace model {


/// <summary>
/// Describes an intervention or an event that happened.
/// </summary>
class  Log
    : public ModelBase
{
public:
    Log();
    virtual ~Log();

    /////////////////////////////////////////////
    /// ModelBase overrides

    void validate() override;

    web::json::value toJson() const override;
    bool fromJson(const web::json::value& json) override;

    void toMultipart(std::shared_ptr<MultipartFormData> multipart, const utility::string_t& namePrefix) const override;
    bool fromMultiPart(std::shared_ptr<MultipartFormData> multipart, const utility::string_t& namePrefix) override;

    /////////////////////////////////////////////
    /// Log members

    /// <summary>
    /// A list of attachment objects.
    /// </summary>
    std::vector<std::shared_ptr<Attachment>>& getAttachments();
    bool attachmentsIsSet() const;
    void unsetAttachments();

    void setAttachments(const std::vector<std::shared_ptr<Attachment>>& value);

    /// <summary>
    /// 
    /// </summary>
    std::shared_ptr<User> getAuthor() const;
    bool authorIsSet() const;
    void unsetAuthor();

    void setAuthor(const std::shared_ptr<User>& value);

    /// <summary>
    /// Unix timestamp when this entity was created.
    /// </summary>
    int64_t getCreatedAt() const;
    bool createdAtIsSet() const;
    void unsetCreatedAt();

    void setCreatedAt(int64_t value);

    /// <summary>
    /// The unique identifier of this entity.
    /// </summary>
    int64_t getId() const;
    bool idIsSet() const;
    void unsetId();

    void setId(int64_t value);

    /// <summary>
    /// 
    /// </summary>
    std::shared_ptr<LogOrigin> getOrigin() const;
    bool originIsSet() const;
    void unsetOrigin();

    void setOrigin(const std::shared_ptr<LogOrigin>& value);

    /// <summary>
    /// The unique identifier of this entity.
    /// </summary>
    int64_t getParentLogId() const;
    bool parentLogIdIsSet() const;
    void unsetParentLogId();

    void setParentLogId(int64_t value);

    /// <summary>
    /// The amount of children of a root log.
    /// </summary>
    int64_t getReplies() const;
    bool repliesIsSet() const;
    void unsetReplies();

    void setReplies(int64_t value);

    /// <summary>
    /// The unique identifier of this entity.
    /// </summary>
    int64_t getRootLogId() const;
    bool rootLogIdIsSet() const;
    void unsetRootLogId();

    void setRootLogId(int64_t value);

    /// <summary>
    /// Array of minified Run objects.
    /// </summary>
    std::vector<std::shared_ptr<Log_runs>>& getRuns();
    bool runsIsSet() const;
    void unsetRuns();

    void setRuns(const std::vector<std::shared_ptr<Log_runs>>& value);

    /// <summary>
    /// A list of Subsystem objects.
    /// </summary>
    std::vector<std::shared_ptr<Subsystem>>& getSubsystems();
    bool subsystemsIsSet() const;
    void unsetSubsystems();

    void setSubsystems(const std::vector<std::shared_ptr<Subsystem>>& value);

    /// <summary>
    /// 
    /// </summary>
    std::shared_ptr<LogSubtype> getSubtype() const;
    bool subtypeIsSet() const;
    void unsetSubtype();

    void setSubtype(const std::shared_ptr<LogSubtype>& value);

    /// <summary>
    /// A list of Tag objects.
    /// </summary>
    std::vector<std::shared_ptr<Tag>>& getTags();
    bool tagsIsSet() const;
    void unsetTags();

    void setTags(const std::vector<std::shared_ptr<Tag>>& value);

    /// <summary>
    /// Body of the log.
    /// </summary>
    utility::string_t getText() const;
    bool textIsSet() const;
    void unsetText();

    void setText(const utility::string_t& value);

    /// <summary>
    /// Title of the log.
    /// </summary>
    utility::string_t getTitle() const;
    bool titleIsSet() const;
    void unsetTitle();

    void setTitle(const utility::string_t& value);

    /// <summary>
    /// Unix timestamp when this entity was last updated.
    /// </summary>
    int64_t getUpdatedAt() const;
    bool updatedAtIsSet() const;
    void unsetUpdatedAt();

    void setUpdatedAt(int64_t value);


protected:
    std::vector<std::shared_ptr<Attachment>> m_Attachments;
    bool m_AttachmentsIsSet;
    std::shared_ptr<User> m_Author;
    bool m_AuthorIsSet;
    int64_t m_CreatedAt;
    bool m_CreatedAtIsSet;
    int64_t m_Id;
    bool m_IdIsSet;
    std::shared_ptr<LogOrigin> m_Origin;
    bool m_OriginIsSet;
    int64_t m_ParentLogId;
    bool m_ParentLogIdIsSet;
    int64_t m_Replies;
    bool m_RepliesIsSet;
    int64_t m_RootLogId;
    bool m_RootLogIdIsSet;
    std::vector<std::shared_ptr<Log_runs>> m_Runs;
    bool m_RunsIsSet;
    std::vector<std::shared_ptr<Subsystem>> m_Subsystems;
    bool m_SubsystemsIsSet;
    std::shared_ptr<LogSubtype> m_Subtype;
    bool m_SubtypeIsSet;
    std::vector<std::shared_ptr<Tag>> m_Tags;
    bool m_TagsIsSet;
    utility::string_t m_Text;
    bool m_TextIsSet;
    utility::string_t m_Title;
    bool m_TitleIsSet;
    int64_t m_UpdatedAt;
    bool m_UpdatedAtIsSet;
};


}
}
}
}

#endif /* ORG_OPENAPITOOLS_CLIENT_MODEL_Log_H_ */
