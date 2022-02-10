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
 * Entity.h
 *
 * Base entity.
 */

#ifndef ORG_OPENAPITOOLS_CLIENT_MODEL_Entity_H_
#define ORG_OPENAPITOOLS_CLIENT_MODEL_Entity_H_


#include "ModelBase.h"


namespace org {
namespace openapitools {
namespace client {
namespace model {


/// <summary>
/// Base entity.
/// </summary>
class  Entity
    : public ModelBase
{
public:
    Entity();
    virtual ~Entity();

    /////////////////////////////////////////////
    /// ModelBase overrides

    void validate() override;

    web::json::value toJson() const override;
    bool fromJson(const web::json::value& json) override;

    void toMultipart(std::shared_ptr<MultipartFormData> multipart, const utility::string_t& namePrefix) const override;
    bool fromMultiPart(std::shared_ptr<MultipartFormData> multipart, const utility::string_t& namePrefix) override;

    /////////////////////////////////////////////
    /// Entity members

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
    /// Unix timestamp when this entity was last updated.
    /// </summary>
    int64_t getUpdatedAt() const;
    bool updatedAtIsSet() const;
    void unsetUpdatedAt();

    void setUpdatedAt(int64_t value);


protected:
    int64_t m_CreatedAt;
    bool m_CreatedAtIsSet;
    int64_t m_Id;
    bool m_IdIsSet;
    int64_t m_UpdatedAt;
    bool m_UpdatedAtIsSet;
};


}
}
}
}

#endif /* ORG_OPENAPITOOLS_CLIENT_MODEL_Entity_H_ */
