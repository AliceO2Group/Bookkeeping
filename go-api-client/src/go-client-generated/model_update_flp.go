/*
 * ALICE Bookkeeping
 *
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * API version: 0.0.0
 * Generated by: Swagger Codegen (https://github.com/swagger-api/swagger-codegen.git)
 */
package swagger

// Describes an update to an flp
type UpdateFlp struct {
	NTimeframes int32 `json:"nTimeframes,omitempty"`
	BytesProcessed int32 `json:"bytesProcessed,omitempty"`
	BytesEquipmentReadOut int32 `json:"bytesEquipmentReadOut,omitempty"`
	BytesRecordingReadOut int32 `json:"bytesRecordingReadOut,omitempty"`
	BytesFairMQReadOut int32 `json:"bytesFairMQReadOut,omitempty"`
}
