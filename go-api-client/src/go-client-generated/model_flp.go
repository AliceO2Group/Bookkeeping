/*
 * ALICE Bookkeeping
 *
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * API version: 0.0.0
 * Generated by: Swagger Codegen (https://github.com/swagger-api/swagger-codegen.git)
 */
package swagger

// Describes an intervention or an event that happened.
type Flp struct {
	BytesEquipmentReadOut int32 `json:"bytesEquipmentReadOut"`
	BytesFairMQReadOut int32 `json:"bytesFairMQReadOut"`
	BytesProcessed int32 `json:"bytesProcessed"`
	BytesRecordingReadOut int32 `json:"bytesRecordingReadOut"`
	// Unix timestamp when this entity was created.
	CreatedAt int32 `json:"createdAt,omitempty"`
	Hostname string `json:"hostname"`
	Id int32 `json:"id"`
	NTimeframes int32 `json:"nTimeframes"`
	Name string `json:"name"`
	// Unix timestamp when this entity was last updated.
	UpdatedAt int32 `json:"updatedAt,omitempty"`
}
