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
 * RunApi.h
 *
 * 
 */

#ifndef ORG_OPENAPITOOLS_CLIENT_API_RunApi_H_
#define ORG_OPENAPITOOLS_CLIENT_API_RunApi_H_


#include "../ApiClient.h"

#include "ArrayOfRunsResponse.h"
#include "Errors.h"
#include "Run.h"
#include "RunResponse.h"


#include <boost/optional.hpp>

namespace org {
namespace openapitools {
namespace client {
namespace api {

using namespace org::openapitools::client::model;



class  RunApi 
{
public:

    explicit RunApi( std::shared_ptr<const ApiClient> apiClient );

    virtual ~RunApi();

    /// <summary>
    /// Creates a run
    /// </summary>
    /// <remarks>
    /// 
    /// </remarks>
    /// <param name="run"></param>
    pplx::task<std::shared_ptr<RunResponse>> createRun(
        std::shared_ptr<Run> run
    ) const;
    /// <summary>
    /// Updates certain fields of a run
    /// </summary>
    /// <remarks>
    /// 
    /// </remarks>
    /// <param name="runId">The id of the run to retrieve</param>
    /// <param name="run"></param>
    pplx::task<std::shared_ptr<RunResponse>> endRun(
        int64_t runId,
        std::shared_ptr<Run> run
    ) const;
    /// <summary>
    /// Gets a run by Id
    /// </summary>
    /// <remarks>
    /// 
    /// </remarks>
    /// <param name="runId">The id of the run to retrieve</param>
    pplx::task<std::shared_ptr<RunResponse>> getRunById(
        int64_t runId
    ) const;
    /// <summary>
    /// List all runs
    /// </summary>
    /// <remarks>
    /// 
    /// </remarks>
    pplx::task<std::shared_ptr<ArrayOfRunsResponse>> listRuns(
    ) const;

protected:
    std::shared_ptr<const ApiClient> m_ApiClient;
};

}
}
}
}

#endif /* ORG_OPENAPITOOLS_CLIENT_API_RunApi_H_ */

