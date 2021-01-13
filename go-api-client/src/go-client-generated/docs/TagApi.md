# {{classname}}

All URIs are relative to */api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CreateTag**](TagApi.md#CreateTag) | **Post** /tags | Adds a new tag
[**DeleteTagById**](TagApi.md#DeleteTagById) | **Delete** /tags/{tagId} | Deletes a tag by Id
[**GetLogsByTagId**](TagApi.md#GetLogsByTagId) | **Get** /tags/{tagId}/logs | Gets all logs with this tag id
[**GetTagById**](TagApi.md#GetTagById) | **Get** /tags/{tagId} | Gets a tag by Id
[**ListTags**](TagApi.md#ListTags) | **Get** /tags | List all tags

# **CreateTag**
> TagResponse CreateTag(ctx, body)
Adds a new tag

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **body** | [**CreateTag**](CreateTag.md)|  | 

### Return type

[**TagResponse**](TagResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **DeleteTagById**
> TagResponse DeleteTagById(ctx, tagId)
Deletes a tag by Id

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **tagId** | [**int64**](.md)| The id of the tag to retrieve | 

### Return type

[**TagResponse**](TagResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **GetLogsByTagId**
> ArrayOfLogsResponse GetLogsByTagId(ctx, tagId)
Gets all logs with this tag id

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **tagId** | [**int64**](.md)| The id of the tag to retrieve | 

### Return type

[**ArrayOfLogsResponse**](ArrayOfLogsResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **GetTagById**
> TagResponse GetTagById(ctx, tagId)
Gets a tag by Id

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **tagId** | [**int64**](.md)| The id of the tag to retrieve | 

### Return type

[**TagResponse**](TagResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **ListTags**
> ArrayOfTagsResponse ListTags(ctx, )
List all tags

### Required Parameters
This endpoint does not need any parameter.

### Return type

[**ArrayOfTagsResponse**](ArrayOfTagsResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

