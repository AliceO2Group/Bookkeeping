# {{classname}}

All URIs are relative to */api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CreateRun**](RunApi.md#CreateRun) | **Post** /runs | Creates a run
[**EndRun**](RunApi.md#EndRun) | **Patch** /runs/{runId} | Updates certain fields of a run
[**GetRunById**](RunApi.md#GetRunById) | **Get** /runs/{runId} | Gets a run by Id
[**ListRuns**](RunApi.md#ListRuns) | **Get** /runs | List all runs

# **CreateRun**
> RunResponse CreateRun(ctx, body)
Creates a run

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **body** | [**Run**](Run.md)|  | 

### Return type

[**RunResponse**](RunResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **EndRun**
> RunResponse EndRun(ctx, body, runId)
Updates certain fields of a run

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **body** | [**Run**](Run.md)|  | 
  **runId** | [**int64**](.md)| The id of the run to retrieve | 

### Return type

[**RunResponse**](RunResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **GetRunById**
> RunResponse GetRunById(ctx, runId)
Gets a run by Id

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **runId** | [**int64**](.md)| The id of the run to retrieve | 

### Return type

[**RunResponse**](RunResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **ListRuns**
> ArrayOfRunsResponse ListRuns(ctx, )
List all runs

### Required Parameters
This endpoint does not need any parameter.

### Return type

[**ArrayOfRunsResponse**](ArrayOfRunsResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

