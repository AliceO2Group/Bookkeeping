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
 * Attachment.h
 *
 * Describes metadata of an attachment.
 */

#ifndef ORG_OPENAPITOOLS_CLIENT_MODEL_Attachment_H_
#define ORG_OPENAPITOOLS_CLIENT_MODEL_Attachment_H_


#include "ModelBase.h"

#include <cpprest/details/basic_types.h>

namespace org {
namespace openapitools {
namespace client {
namespace model {


/// <summary>
/// Describes metadata of an attachment.
/// </summary>
class  Attachment
    : public ModelBase
{
public:
    Attachment();
    virtual ~Attachment();

    /////////////////////////////////////////////
    /// ModelBase overrides

    void validate() override;

    web::json::value toJson() const override;
    bool fromJson(const web::json::value& json) override;

    void toMultipart(std::shared_ptr<MultipartFormData> multipart, const utility::string_t& namePrefix) const override;
    bool fromMultiPart(std::shared_ptr<MultipartFormData> multipart, const utility::string_t& namePrefix) override;

    /////////////////////////////////////////////
    /// Attachment members

    /// <summary>
    /// Unix timestamp when this entity was created.
    /// </summary>
    int64_t getCreatedAt() const;
    bool createdAtIsSet() const;
    void unsetCreatedAt();

    void setCreatedAt(int64_t value);

    /// <summary>
    /// Encoding used on the file.
    /// </summary>
    utility::string_t getEncoding() const;
    bool encodingIsSet() const;
    void unsetEncoding();

    void setEncoding(const utility::string_t& value);

    /// <summary>
    /// Name of a file.
    /// </summary>
    utility::string_t getFileName() const;
    bool fileNameIsSet() const;
    void unsetFileName();

    void setFileName(const utility::string_t& value);

    /// <summary>
    /// The unique identifier of this entity.
    /// </summary>
    int64_t getId() const;
    bool idIsSet() const;
    void unsetId();

    void setId(int64_t value);

    /// <summary>
    /// The unique identifier of this entity.
    /// </summary>
    int64_t getLogId() const;
    bool logIdIsSet() const;
    void unsetLogId();

    void setLogId(int64_t value);

    /// <summary>
    /// Mime-type of a file.
    /// </summary>
    utility::string_t getMimeType() const;
    bool mimeTypeIsSet() const;
    void unsetMimeType();

    void setMimeType(const utility::string_t& value);

    /// <summary>
    /// Original name of a file.
    /// </summary>
    utility::string_t getOriginalName() const;
    bool originalNameIsSet() const;
    void unsetOriginalName();

    void setOriginalName(const utility::string_t& value);

    /// <summary>
    /// Path of where the file is stored.
    /// </summary>
    utility::string_t getPath() const;
    bool pathIsSet() const;
    void unsetPath();

    void setPath(const utility::string_t& value);

    /// <summary>
    /// Size of a file.
    /// </summary>
    int64_t getSize() const;
    bool sizeIsSet() const;
    void unsetSize();

    void setSize(int64_t value);

    /// <summary>
    /// Unix timestamp when this entity was created.
    /// </summary>
    int64_t getUpdatedAt() const;
    bool updatedAtIsSet() const;
    void unsetUpdatedAt();

    void setUpdatedAt(int64_t value);


protected:
    int64_t m_CreatedAt;
    bool m_CreatedAtIsSet;
    utility::string_t m_Encoding;
    bool m_EncodingIsSet;
    utility::string_t m_FileName;
    bool m_FileNameIsSet;
    int64_t m_Id;
    bool m_IdIsSet;
    int64_t m_LogId;
    bool m_LogIdIsSet;
    utility::string_t m_MimeType;
    bool m_MimeTypeIsSet;
    utility::string_t m_OriginalName;
    bool m_OriginalNameIsSet;
    utility::string_t m_Path;
    bool m_PathIsSet;
    int64_t m_Size;
    bool m_SizeIsSet;
    int64_t m_UpdatedAt;
    bool m_UpdatedAtIsSet;
};


}
}
}
}

#endif /* ORG_OPENAPITOOLS_CLIENT_MODEL_Attachment_H_ */
