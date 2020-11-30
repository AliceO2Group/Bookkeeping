/**
 * ALICE Bookkeeping
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 0.0.0
 *
 * NOTE: This class is auto generated by OpenAPI-Generator 5.0.0-beta2.
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/*
 * FilterLogsTagOptions.h
 *
 * Specifies the tag related filter requirements for a request.
 */

#ifndef ORG_OPENAPITOOLS_CLIENT_MODEL_FilterLogsTagOptions_H_
#define ORG_OPENAPITOOLS_CLIENT_MODEL_FilterLogsTagOptions_H_


#include "../ModelBase.h"

#include <cpprest/details/basic_types.h>

namespace org {
namespace openapitools {
namespace client {
namespace model {


/// <summary>
/// Specifies the tag related filter requirements for a request.
/// </summary>
class  FilterLogsTagOptions
    : public ModelBase
{
public:
    FilterLogsTagOptions();
    virtual ~FilterLogsTagOptions();

    /////////////////////////////////////////////
    /// ModelBase overrides

    void validate() override;

    web::json::value toJson() const override;
    bool fromJson(const web::json::value& json) override;

    void toMultipart(std::shared_ptr<MultipartFormData> multipart, const utility::string_t& namePrefix) const override;
    bool fromMultiPart(std::shared_ptr<MultipartFormData> multipart, const utility::string_t& namePrefix) override;

    /////////////////////////////////////////////
    /// FilterLogsTagOptions members

    /// <summary>
    /// The operation indicating the relation between the data.
    /// </summary>
    utility::string_t getOperation() const;
    bool operationIsSet() const;
    void unsetOperation();

    void setOperation(const utility::string_t& value);

    /// <summary>
    /// CSV style string of EntityIds.
    /// </summary>
    utility::string_t getValues() const;
    bool valuesIsSet() const;
    void unsetValues();

    void setValues(const utility::string_t& value);


protected:
    utility::string_t m_Operation;
    bool m_OperationIsSet;
    utility::string_t m_Values;
    bool m_ValuesIsSet;
};


}
}
}
}

#endif /* ORG_OPENAPITOOLS_CLIENT_MODEL_FilterLogsTagOptions_H_ */
