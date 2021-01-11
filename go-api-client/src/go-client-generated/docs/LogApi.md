# {{classname}}

All URIs are relative to */api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CreateLog**](LogApi.md#CreateLog) | **Post** /logs | Adds a new log
[**GetLogAttachment**](LogApi.md#GetLogAttachment) | **Get** /logs/{logId}/attachments/{attachmentId} | Get one specific attachment associated with a log
[**GetLogById**](LogApi.md#GetLogById) | **Get** /logs/{logId} | Gets a log by Id
[**GetLogTree**](LogApi.md#GetLogTree) | **Get** /logs/{logId}/tree | Get the Log tree for a given Log
[**ListLogAttachments**](LogApi.md#ListLogAttachments) | **Get** /logs/{logId}/attachments | Get all attachments associated with a log
[**ListLogs**](LogApi.md#ListLogs) | **Get** /logs | List all logs
[**ListTagsByLogId**](LogApi.md#ListTagsByLogId) | **Get** /logs/{logId}/tags | Lists all tags associated with a log

# **CreateLog**
> LogResponse CreateLog(ctx, body)
Adds a new log

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **body** | [**CreateLog**](CreateLog.md)|  | 

### Return type

[**LogResponse**](LogResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **GetLogAttachment**
> AttachmentResponse GetLogAttachment(ctx, logId, attachmentId)
Get one specific attachment associated with a log

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **logId** | [**int32**](.md)| The id of the log to retrieve | 
  **attachmentId** | [**int32**](.md)| The id of the attached to retrieve | 

### Return type

[**AttachmentResponse**](AttachmentResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **GetLogById**
> LogResponse GetLogById(ctx, logId)
Gets a log by Id

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **logId** | [**int32**](.md)| The id of the log to retrieve | 

### Return type

[**LogResponse**](LogResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **GetLogTree**
> LogTreeResponse GetLogTree(ctx, logId)
Get the Log tree for a given Log

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **logId** | [**int32**](.md)| The id of the log to retrieve | 

### Return type

[**LogTreeResponse**](LogTreeResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **ListLogAttachments**
> ArrayOfAttachmentsResponse ListLogAttachments(ctx, logId)
Get all attachments associated with a log

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **logId** | [**int32**](.md)| The id of the log to retrieve | 

### Return type

[**ArrayOfAttachmentsResponse**](ArrayOfAttachmentsResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **ListLogs**
> ArrayOfLogsResponse ListLogs(ctx, )
List all logs

### Required Parameters
This endpoint does not need any parameter.

### Return type

[**ArrayOfLogsResponse**](ArrayOfLogsResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **ListTagsByLogId**
> ArrayOfTagsResponse ListTagsByLogId(ctx, logId)
Lists all tags associated with a log

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **logId** | [**int32**](.md)| The id of the log to retrieve | 

### Return type

[**ArrayOfTagsResponse**](ArrayOfTagsResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

