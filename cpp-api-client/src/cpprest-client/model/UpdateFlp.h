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
 * UpdateFlp.h
 *
 * Describes an update to an flp
 */

#ifndef ORG_OPENAPITOOLS_CLIENT_MODEL_UpdateFlp_H_
#define ORG_OPENAPITOOLS_CLIENT_MODEL_UpdateFlp_H_


#include "ModelBase.h"


namespace org {
namespace openapitools {
namespace client {
namespace model {


/// <summary>
/// Describes an update to an flp
/// </summary>
class  UpdateFlp
    : public ModelBase
{
public:
    UpdateFlp();
    virtual ~UpdateFlp();

    /////////////////////////////////////////////
    /// ModelBase overrides

    void validate() override;

    web::json::value toJson() const override;
    bool fromJson(const web::json::value& json) override;

    void toMultipart(std::shared_ptr<MultipartFormData> multipart, const utility::string_t& namePrefix) const override;
    bool fromMultiPart(std::shared_ptr<MultipartFormData> multipart, const utility::string_t& namePrefix) override;

    /////////////////////////////////////////////
    /// UpdateFlp members

    /// <summary>
    /// Number of subtimeframes processed in this FLP. Updated regularly.
    /// </summary>
    int64_t getNTimeframes() const;
    bool nTimeframesIsSet() const;
    void unsetNTimeframes();

    void setNTimeframes(int64_t value);

    /// <summary>
    /// Total data volume read out in bytes.
    /// </summary>
    int64_t getBytesProcessed() const;
    bool bytesProcessedIsSet() const;
    void unsetBytesProcessed();

    void setBytesProcessed(int64_t value);

    /// <summary>
    /// Total data volume out from the readout &#39;equipment&#39; component in bytes. Can reach PetaBytes. Updated regularly.
    /// </summary>
    int64_t getBytesEquipmentReadOut() const;
    bool bytesEquipmentReadOutIsSet() const;
    void unsetBytesEquipmentReadOut();

    void setBytesEquipmentReadOut(int64_t value);

    /// <summary>
    /// Total data volume out from the readout &#39;recording&#39; component in bytes. Can reach PetaBytes. Updated regularly.
    /// </summary>
    int64_t getBytesRecordingReadOut() const;
    bool bytesRecordingReadOutIsSet() const;
    void unsetBytesRecordingReadOut();

    void setBytesRecordingReadOut(int64_t value);

    /// <summary>
    /// Total data volume out from the readout &#39;fmq&#39; component in bytes. Can reach PetaBytes. Updated regularly.
    /// </summary>
    int64_t getBytesFairMQReadOut() const;
    bool bytesFairMQReadOutIsSet() const;
    void unsetBytesFairMQReadOut();

    void setBytesFairMQReadOut(int64_t value);


protected:
    int64_t m_NTimeframes;
    bool m_NTimeframesIsSet;
    int64_t m_BytesProcessed;
    bool m_BytesProcessedIsSet;
    int64_t m_BytesEquipmentReadOut;
    bool m_BytesEquipmentReadOutIsSet;
    int64_t m_BytesRecordingReadOut;
    bool m_BytesRecordingReadOutIsSet;
    int64_t m_BytesFairMQReadOut;
    bool m_BytesFairMQReadOutIsSet;
};


}
}
}
}

#endif /* ORG_OPENAPITOOLS_CLIENT_MODEL_UpdateFlp_H_ */
