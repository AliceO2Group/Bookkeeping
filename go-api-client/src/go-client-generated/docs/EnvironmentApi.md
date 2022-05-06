# {{classname}}

All URIs are relative to */api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CreateEnvironment**](EnvironmentApi.md#CreateEnvironment) | **Post** /environments | Creation of the environment object.
[**ListEnvironments**](EnvironmentApi.md#ListEnvironments) | **Get** /environments | Fetches all the environments
[**ReplaceEnvironment**](EnvironmentApi.md#ReplaceEnvironment) | **Put** /environments/{envId} | Update of the environment object.

# **CreateEnvironment**
> EnvironmentResponse CreateEnvironment(ctx, body)
Creation of the environment object.

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **body** | [**CreateEnvironment**](CreateEnvironment.md)|  | 

### Return type

[**EnvironmentResponse**](EnvironmentResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **ListEnvironments**
> ArrayOfEnvironmentsResponse ListEnvironments(ctx, )
Fetches all the environments

### Required Parameters
This endpoint does not need any parameter.

### Return type

[**ArrayOfEnvironmentsResponse**](ArrayOfEnvironmentsResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **ReplaceEnvironment**
> EnvironmentResponse ReplaceEnvironment(ctx, body, envId)
Update of the environment object.

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **body** | [**UpdateEnvironment**](UpdateEnvironment.md)|  | 
  **envId** | [**string**](.md)| The id of the environment to receive | 

### Return type

[**EnvironmentResponse**](EnvironmentResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

