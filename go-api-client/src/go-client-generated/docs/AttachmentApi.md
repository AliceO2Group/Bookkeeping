# {{classname}}

All URIs are relative to */api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CreateAttachment**](AttachmentApi.md#CreateAttachment) | **Post** /attachments | Create a new attachment on a log
[**GetAttachment**](AttachmentApi.md#GetAttachment) | **Get** /attachments/{attachmentId} | Get one specific attachment

# **CreateAttachment**
> ArrayOfAttachmentsResponse CreateAttachment(ctx, body)
Create a new attachment on a log

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **body** | [**CreateAttachments**](CreateAttachments.md)|  | 

### Return type

[**ArrayOfAttachmentsResponse**](ArrayOfAttachmentsResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **GetAttachment**
> ArrayOfAttachmentsResponse GetAttachment(ctx, attachmentId)
Get one specific attachment

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **attachmentId** | [**int64**](.md)| The id of the attached to retrieve | 

### Return type

[**ArrayOfAttachmentsResponse**](ArrayOfAttachmentsResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

