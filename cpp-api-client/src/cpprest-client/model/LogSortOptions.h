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
 * LogSortOptions.h
 *
 * Specifies the sorting requirements of a log request.
 */

#ifndef ORG_OPENAPITOOLS_CLIENT_MODEL_LogSortOptions_H_
#define ORG_OPENAPITOOLS_CLIENT_MODEL_LogSortOptions_H_


#include "ModelBase.h"

#include "model/SortOrder.h"

namespace org {
namespace openapitools {
namespace client {
namespace model {


/// <summary>
/// Specifies the sorting requirements of a log request.
/// </summary>
class  LogSortOptions
    : public ModelBase
{
public:
    LogSortOptions();
    virtual ~LogSortOptions();

    /////////////////////////////////////////////
    /// ModelBase overrides

    void validate() override;

    web::json::value toJson() const override;
    bool fromJson(const web::json::value& json) override;

    void toMultipart(std::shared_ptr<MultipartFormData> multipart, const utility::string_t& namePrefix) const override;
    bool fromMultiPart(std::shared_ptr<MultipartFormData> multipart, const utility::string_t& namePrefix) override;

    /////////////////////////////////////////////
    /// LogSortOptions members

    /// <summary>
    /// 
    /// </summary>
    std::shared_ptr<SortOrder> getAuthor() const;
    bool authorIsSet() const;
    void unsetAuthor();

    void setAuthor(const std::shared_ptr<SortOrder>& value);

    /// <summary>
    /// 
    /// </summary>
    std::shared_ptr<SortOrder> getCreatedAt() const;
    bool createdAtIsSet() const;
    void unsetCreatedAt();

    void setCreatedAt(const std::shared_ptr<SortOrder>& value);

    /// <summary>
    /// 
    /// </summary>
    std::shared_ptr<SortOrder> getId() const;
    bool idIsSet() const;
    void unsetId();

    void setId(const std::shared_ptr<SortOrder>& value);

    /// <summary>
    /// 
    /// </summary>
    std::shared_ptr<SortOrder> getTags() const;
    bool tagsIsSet() const;
    void unsetTags();

    void setTags(const std::shared_ptr<SortOrder>& value);

    /// <summary>
    /// 
    /// </summary>
    std::shared_ptr<SortOrder> getTitle() const;
    bool titleIsSet() const;
    void unsetTitle();

    void setTitle(const std::shared_ptr<SortOrder>& value);


protected:
    std::shared_ptr<SortOrder> m_Author;
    bool m_AuthorIsSet;
    std::shared_ptr<SortOrder> m_CreatedAt;
    bool m_CreatedAtIsSet;
    std::shared_ptr<SortOrder> m_Id;
    bool m_IdIsSet;
    std::shared_ptr<SortOrder> m_Tags;
    bool m_TagsIsSet;
    std::shared_ptr<SortOrder> m_Title;
    bool m_TitleIsSet;
};


}
}
}
}

#endif /* ORG_OPENAPITOOLS_CLIENT_MODEL_LogSortOptions_H_ */
