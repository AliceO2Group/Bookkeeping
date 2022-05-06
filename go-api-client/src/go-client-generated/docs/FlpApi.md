# {{classname}}

All URIs are relative to */api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CreateFlp**](FlpApi.md#CreateFlp) | **Post** /flps | Adds a new flp
[**GetFlpById**](FlpApi.md#GetFlpById) | **Get** /flps/{flpName}/runs/{runNumber} | Gets a flp by Name
[**ListFlps**](FlpApi.md#ListFlps) | **Get** /flps | List all flps
[**UpdateFlp**](FlpApi.md#UpdateFlp) | **Patch** /flps/{flpName}/runs/{runNumber} | Update an existing flp

# **CreateFlp**
> FlpResponse CreateFlp(ctx, body)
Adds a new flp

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **body** | [**CreateFlp**](CreateFlp.md)|  | 

### Return type

[**FlpResponse**](FlpResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **GetFlpById**
> FlpResponse GetFlpById(ctx, flpName, runNumber)
Gets a flp by Name

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **flpName** | [**string**](.md)| The id of the flp to retrieve | 
  **runNumber** | [**int32**](.md)| The id of the runNumber to retrieve | 

### Return type

[**FlpResponse**](FlpResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **ListFlps**
> ArrayOfFlpsResponse ListFlps(ctx, )
List all flps

### Required Parameters
This endpoint does not need any parameter.

### Return type

[**ArrayOfFlpsResponse**](ArrayOfFlpsResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **UpdateFlp**
> FlpResponse UpdateFlp(ctx, body, flpName, runNumber)
Update an existing flp

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **body** | [**UpdateFlp**](UpdateFlp.md)|  | 
  **flpName** | [**string**](.md)| The id of the flp to retrieve | 
  **runNumber** | [**int32**](.md)| The id of the runNumber to retrieve | 

### Return type

[**FlpResponse**](FlpResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

