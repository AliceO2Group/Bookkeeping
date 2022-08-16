# Environment

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** |  | [default to null]
**CreatedAt** | **int32** | Unix timestamp when this entity was created. | [optional] [default to null]
**UpdatedAt** | **int32** | Unix timestamp when this entity was last updated. | [optional] [default to null]
**ToredownAt** | [**time.Time**](time.Time.md) | Unix timestamp when this entity was tore down. | [optional] [default to null]
**Status** | **string** | The status of the environment. | [optional] [default to null]
**StatusMessage** | **string** | A message explaining the status or the current state of the environment. | [optional] [default to null]
**Runs** | [**[]Run**](Run.md) | Array of minified Run objects. | [optional] [default to null]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

