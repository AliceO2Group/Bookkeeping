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
 * GuiStatus.h
 *
 * GUI status
 */

#ifndef ORG_OPENAPITOOLS_CLIENT_MODEL_GuiStatus_H_
#define ORG_OPENAPITOOLS_CLIENT_MODEL_GuiStatus_H_


#include "ModelBase.h"


namespace org {
namespace openapitools {
namespace client {
namespace model {


/// <summary>
/// GUI status
/// </summary>
class  GuiStatus
    : public ModelBase
{
public:
    GuiStatus();
    virtual ~GuiStatus();

    /////////////////////////////////////////////
    /// ModelBase overrides

    void validate() override;

    web::json::value toJson() const override;
    bool fromJson(const web::json::value& json) override;

    void toMultipart(std::shared_ptr<MultipartFormData> multipart, const utility::string_t& namePrefix) const override;
    bool fromMultiPart(std::shared_ptr<MultipartFormData> multipart, const utility::string_t& namePrefix) override;

    /////////////////////////////////////////////
    /// GuiStatus members

    /// <summary>
    /// 
    /// </summary>
    bool isOk() const;
    bool okIsSet() const;
    void unsetOk();

    void setOk(bool value);

    /// <summary>
    /// 
    /// </summary>
    bool isConfigured() const;
    bool configuredIsSet() const;
    void unsetConfigured();

    void setConfigured(bool value);


protected:
    bool m_Ok;
    bool m_OkIsSet;
    bool m_Configured;
    bool m_ConfiguredIsSet;
};


}
}
}
}

#endif /* ORG_OPENAPITOOLS_CLIENT_MODEL_GuiStatus_H_ */
