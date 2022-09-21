/*
 * ALICE Bookkeeping
 *
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * API version: 0.0.0
 * Generated by: Swagger Codegen (https://github.com/swagger-api/swagger-codegen.git)
 */
package swagger
// RunType : Specifies the type of run.
type RunType string

// List of RunType
const (
	NONE_RunType RunType = "NONE"
	CALIBRATION_ITHR_TUNING_RunType RunType = "CALIBRATION_ITHR_TUNING"
	CALIBRATION_VCASN_TUNING_RunType RunType = "CALIBRATION_VCASN_TUNING"
	CALIBRATION_THR_SCAN_RunType RunType = "CALIBRATION_THR_SCAN"
	CALIBRATION_DIGITAL_SCAN_RunType RunType = "CALIBRATION_DIGITAL_SCAN"
	CALIBRATION_ANALOG_SCAN_RunType RunType = "CALIBRATION_ANALOG_SCAN"
	CALIBRATION_FHR_RunType RunType = "CALIBRATION_FHR"
	CALIBRATION_ALPIDE_SCAN_RunType RunType = "CALIBRATION_ALPIDE_SCAN"
	COSMICS_RunType RunType = "COSMICS"
	LASER_RunType RunType = "LASER"
	PEDESTAL_RunType RunType = "PEDESTAL"
	PHYSICS_RunType RunType = "PHYSICS"
	PULSER_RunType RunType = "PULSER"
	TECHNICAL_RunType RunType = "TECHNICAL"
	SYNTHETIC_RunType RunType = "SYNTHETIC"
)
