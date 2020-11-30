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
 * FlpApi.h
 *
 * 
 */

#ifndef ORG_OPENAPITOOLS_CLIENT_API_FlpApi_H_
#define ORG_OPENAPITOOLS_CLIENT_API_FlpApi_H_


#include "../ApiClient.h"

#include "ArrayOfFlpsResponse.h"
#include "CreateFlp.h"
#include "Errors.h"
#include "FlpResponse.h"
#include "LogResponse.h"
#include "UpdateFlp.h"


#include <boost/optional.hpp>

namespace org {
namespace openapitools {
namespace client {
namespace api {

using namespace org::openapitools::client::model;



class  FlpApi 
{
public:

    explicit FlpApi( std::shared_ptr<const ApiClient> apiClient );

    virtual ~FlpApi();

    /// <summary>
    /// Adds a new flp
    /// </summary>
    /// <remarks>
    /// 
    /// </remarks>
    /// <param name="createFlp"></param>
    pplx::task<std::shared_ptr<LogResponse>> createFlp(
        std::shared_ptr<CreateFlp> createFlp
    ) const;
    /// <summary>
    /// Gets a flp by Id
    /// </summary>
    /// <remarks>
    /// 
    /// </remarks>
    /// <param name="flpId">The id of the flp to retrieve</param>
    pplx::task<std::shared_ptr<FlpResponse>> getFlpById(
        int32_t flpId
    ) const;
    /// <summary>
    /// List all flps
    /// </summary>
    /// <remarks>
    /// 
    /// </remarks>
    pplx::task<std::shared_ptr<ArrayOfFlpsResponse>> listFlps(
    ) const;
    /// <summary>
    /// Update an existing flp
    /// </summary>
    /// <remarks>
    /// 
    /// </remarks>
    /// <param name="flpId">The id of the flp to retrieve</param>
    /// <param name="updateFlp"></param>
    pplx::task<std::shared_ptr<FlpResponse>> updateFlp(
        int32_t flpId,
        std::shared_ptr<UpdateFlp> updateFlp
    ) const;

protected:
    std::shared_ptr<const ApiClient> m_ApiClient;
};

}
}
}
}

#endif /* ORG_OPENAPITOOLS_CLIENT_API_FlpApi_H_ */

