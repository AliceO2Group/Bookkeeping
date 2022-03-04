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



#include "User.h"

namespace org {
namespace openapitools {
namespace client {
namespace model {




User::User()
{
    m_ExternalId = 0L;
    m_ExternalIdIsSet = false;
    m_Id = 0L;
    m_IdIsSet = false;
    m_Name = utility::conversions::to_string_t("");
    m_NameIsSet = false;
}

User::~User()
{
}

void User::validate()
{
    // TODO: implement validation
}

web::json::value User::toJson() const
{

    web::json::value val = web::json::value::object();
    
    if(m_ExternalIdIsSet)
    {
        val[utility::conversions::to_string_t(U("externalId"))] = ModelBase::toJson(m_ExternalId);
    }
    if(m_IdIsSet)
    {
        val[utility::conversions::to_string_t(U("id"))] = ModelBase::toJson(m_Id);
    }
    if(m_NameIsSet)
    {
        val[utility::conversions::to_string_t(U("name"))] = ModelBase::toJson(m_Name);
    }

    return val;
}

bool User::fromJson(const web::json::value& val)
{
    bool ok = true;
    
    if(val.has_field(utility::conversions::to_string_t(U("externalId"))))
    {
        const web::json::value& fieldValue = val.at(utility::conversions::to_string_t(U("externalId")));
        if(!fieldValue.is_null())
        {
            int64_t refVal_externalId;
            ok &= ModelBase::fromJson(fieldValue, refVal_externalId);
            setExternalId(refVal_externalId);
        }
    }
    if(val.has_field(utility::conversions::to_string_t(U("id"))))
    {
        const web::json::value& fieldValue = val.at(utility::conversions::to_string_t(U("id")));
        if(!fieldValue.is_null())
        {
            int64_t refVal_id;
            ok &= ModelBase::fromJson(fieldValue, refVal_id);
            setId(refVal_id);
        }
    }
    if(val.has_field(utility::conversions::to_string_t(U("name"))))
    {
        const web::json::value& fieldValue = val.at(utility::conversions::to_string_t(U("name")));
        if(!fieldValue.is_null())
        {
            utility::string_t refVal_name;
            ok &= ModelBase::fromJson(fieldValue, refVal_name);
            setName(refVal_name);
        }
    }
    return ok;
}

void User::toMultipart(std::shared_ptr<MultipartFormData> multipart, const utility::string_t& prefix) const
{
    utility::string_t namePrefix = prefix;
    if(namePrefix.size() > 0 && namePrefix.substr(namePrefix.size() - 1) != utility::conversions::to_string_t(U(".")))
    {
        namePrefix += utility::conversions::to_string_t(U("."));
    }
    if(m_ExternalIdIsSet)
    {
        multipart->add(ModelBase::toHttpContent(namePrefix + utility::conversions::to_string_t(U("externalId")), m_ExternalId));
    }
    if(m_IdIsSet)
    {
        multipart->add(ModelBase::toHttpContent(namePrefix + utility::conversions::to_string_t(U("id")), m_Id));
    }
    if(m_NameIsSet)
    {
        multipart->add(ModelBase::toHttpContent(namePrefix + utility::conversions::to_string_t(U("name")), m_Name));
    }
}

bool User::fromMultiPart(std::shared_ptr<MultipartFormData> multipart, const utility::string_t& prefix)
{
    bool ok = true;
    utility::string_t namePrefix = prefix;
    if(namePrefix.size() > 0 && namePrefix.substr(namePrefix.size() - 1) != utility::conversions::to_string_t(U(".")))
    {
        namePrefix += utility::conversions::to_string_t(U("."));
    }

    if(multipart->hasContent(utility::conversions::to_string_t(U("externalId"))))
    {
        int64_t refVal_externalId;
        ok &= ModelBase::fromHttpContent(multipart->getContent(utility::conversions::to_string_t(U("externalId"))), refVal_externalId );
        setExternalId(refVal_externalId);
    }
    if(multipart->hasContent(utility::conversions::to_string_t(U("id"))))
    {
        int64_t refVal_id;
        ok &= ModelBase::fromHttpContent(multipart->getContent(utility::conversions::to_string_t(U("id"))), refVal_id );
        setId(refVal_id);
    }
    if(multipart->hasContent(utility::conversions::to_string_t(U("name"))))
    {
        utility::string_t refVal_name;
        ok &= ModelBase::fromHttpContent(multipart->getContent(utility::conversions::to_string_t(U("name"))), refVal_name );
        setName(refVal_name);
    }
    return ok;
}

int64_t User::getExternalId() const
{
    return m_ExternalId;
}

void User::setExternalId(int64_t value)
{
    m_ExternalId = value;
    m_ExternalIdIsSet = true;
}

bool User::externalIdIsSet() const
{
    return m_ExternalIdIsSet;
}

void User::unsetExternalId()
{
    m_ExternalIdIsSet = false;
}
int64_t User::getId() const
{
    return m_Id;
}

void User::setId(int64_t value)
{
    m_Id = value;
    m_IdIsSet = true;
}

bool User::idIsSet() const
{
    return m_IdIsSet;
}

void User::unsetId()
{
    m_IdIsSet = false;
}
utility::string_t User::getName() const
{
    return m_Name;
}

void User::setName(const utility::string_t& value)
{
    m_Name = value;
    m_NameIsSet = true;
}

bool User::nameIsSet() const
{
    return m_NameIsSet;
}

void User::unsetName()
{
    m_NameIsSet = false;
}
}
}
}
}


