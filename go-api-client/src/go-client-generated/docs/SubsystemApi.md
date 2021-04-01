# {{classname}}

All URIs are relative to */api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CreateSubsystem**](SubsystemApi.md#CreateSubsystem) | **Post** /subsystems | Adds a new subsystem
[**DeleteSubsystem**](SubsystemApi.md#DeleteSubsystem) | **Delete** /subsystems/{subsystemId} | Deletes a subsystem by Id
[**GetSubsystem**](SubsystemApi.md#GetSubsystem) | **Get** /subsystems/{subsystemId} | Get a subsystem by Id
[**ListSubsystems**](SubsystemApi.md#ListSubsystems) | **Get** /subsystems | List all subsystems

# **CreateSubsystem**
> SubsystemResponse CreateSubsystem(ctx, body)
Adds a new subsystem

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **body** | [**CreateSubsystem**](CreateSubsystem.md)|  | 

### Return type

[**SubsystemResponse**](SubsystemResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **DeleteSubsystem**
> SubsystemResponse DeleteSubsystem(ctx, subsystemId)
Deletes a subsystem by Id

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **subsystemId** | [**int32**](.md)| The id of the subsystem to retrieve | 

### Return type

[**SubsystemResponse**](SubsystemResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **GetSubsystem**
> SubsystemResponse GetSubsystem(ctx, subsystemId)
Get a subsystem by Id

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **subsystemId** | [**int32**](.md)| The id of the subsystem to retrieve | 

### Return type

[**SubsystemResponse**](SubsystemResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **ListSubsystems**
> ArrayOfSubsystemsResponse ListSubsystems(ctx, )
List all subsystems

### Required Parameters
This endpoint does not need any parameter.

### Return type

[**ArrayOfSubsystemsResponse**](ArrayOfSubsystemsResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

