package src

import "context"
import "fmt"
import sw "github.com/AliceO2Group/Bookkeeping/go-api-client/src/go-client-generated"

var api *sw.APIClient
var auth context.Context

/**
 * Initialeze api
 *
 * @param baseUrl String which is the base url used
 * @param apiKey Current apikey while running the system
 */
func InitializeApi(baseUrl string, apiKey string) {

	cfg := &sw.Configuration{
		BasePath:      baseUrl, // todo: host should be used in combination with basePath (which should be /api) but we haven't gotten it to work properly yet.
		DefaultHeader: make(map[string]string),
		UserAgent:     "Swagger-Codegen/1.0.0/go",
	}

	api = sw.NewAPIClient(cfg)

	auth = context.WithValue(context.Background(), sw.ContextAPIKey, sw.APIKey{
		Key: apiKey,
	})
}

/**
 * Starts a run
 *
 * @param activityId Control ID string. Can be a long hash, 32 or 64 character long
 * @param nDetectors Number of detectors in the Run
 * @param nEpns Number of EPN nodes in the Run
 * @param nFlps Number of FLP nodes in the Run
 * @param runNumber Integer ID of a specific data taking session
 * @param runType Type of run. Might be replaced by tags
 * @param o2Start Time (UTC) when command to start a new Run was given
 * @param triggerStart Time (UTC) when Trigger subsystem was started
 */
func CreateRun(activityId string, nDetectors int64, nEpns int64, nFlps int64, runNumber int64, runType sw.RunType, timeO2Start int64, timeTrgStart int64) {
	var runtype sw.RunType = runType

	obj := sw.Run{
		ActivityId:   activityId,
		NDetectors:   nDetectors,
		NEpns:        nEpns,
		NFlps:        nFlps,
		RunNumber:    runNumber,
		RunType:      &runtype,
		TimeO2Start:  timeO2Start,
		TimeTrgStart: timeTrgStart,
	}

	arrayResponse, response, err := api.RunApi.CreateRun(auth, obj)
	fmt.Println(arrayResponse, response, err)
}

/**
 * Ends a run
 *
 * @param runNumber Integer ID of a specific data taking session
 * @param runQuality Overall quality of the data from O2 point of view
 * @param o2End Time (UTC) when Run was completely stopped
 * @param triggerEnd (UTC) Time when Trigger subsystem was stopped
 */
func UpdateRun(runNumber int64, runQuality sw.RunQuality, timeO2End int64, timeTrgEnd int64) {
	var runquality sw.RunQuality = runQuality

	obj := sw.Run{
		RunQuality: &runquality,
		TimeO2End:  timeO2End,
		TimeTrgEnd: timeTrgEnd,
	}

	arrayResponse, response, err := api.RunApi.EndRun(auth, obj, runNumber)
	fmt.Println(arrayResponse, response, err)
}

/**
 * Adds an FLP to a run
 *
 * @param name Identifying name of the FLP
 * @param hostName Host name of the FLP
 * @param runNumber Integer ID of a specific data taking session
 */
func CreateFlp(name string, hostName string, runNumber int64) {

	obj := sw.CreateFlp{
		Name:      name,
		Hostname:  hostName,
		RunNumber: runNumber,
	}

	arrayResponse, response, err := api.FlpApi.CreateFlp(auth, obj)
	fmt.Println(arrayResponse, response, err)
}

/**
 * Update flp by id
 *
 * @param flpId Integer ID of a specific data taking session.
 * @param flpName Identifying name of the FLP.
 * @param nSubtimeframes Number of subtimeframes processed in this FLP. Updated regularly.
 * @param nEquipmentBytes Data volume out from the readout 'equipment' component in bytes. Can reach PetaBytes. Updated regularly.
 * @param nRecordingBytes Data volume out from the readout 'recording' component in bytes. Can reach PetaBytes. Updated regularly.
 * @param nFairMqBytes Data volume out from the readout 'fmq' component in bytes. Can reach PetaBytes. Updated regularly.
 */
func UpdateFlp(flpId int64, name string, nSubtimeframes int64, nEquipmentBytes int64, nRecordingBytes int64, nFairMQBytes int64) {
	obj := sw.UpdateFlp{
		NTimeframes:           nSubtimeframes,
		BytesEquipmentReadOut: nEquipmentBytes,
		BytesRecordingReadOut: nRecordingBytes,
		BytesFairMQReadOut:    nFairMQBytes,
	}

	arrayResponse, response, err := api.FlpApi.UpdateFlp(auth, obj, flpId)
	fmt.Println(arrayResponse, response, err)
}

/**
 * Create a log
 *
 * @param text Log entry that is written by the shifter
 * @param title Title for the log
 * @param runNumbers Vector of runNumbers that the log is about
 * @param parentLogId Integer id of the parent log
 */
// todo: keep runNumbers as string? or convert to css (comma separated string) in function body?
func CreateLog(text string, title string, runNumbers string, parentLogId int64) {

	// todo: remove if-statement with optional parameter-like construct.
	if parentLogId == -1 {
		obj := sw.CreateLog{
			Text:       text,
			Title:      title,
			RunNumbers: runNumbers,
		}
		arrayResponse, response, err := api.LogApi.CreateLog(auth, obj)
		fmt.Println(arrayResponse, response, err)
	} else {
		obj := sw.CreateLog{
			Text:        text,
			Title:       title,
			RunNumbers:  runNumbers,
			ParentLogId: parentLogId,
		}
		arrayResponse, response, err := api.LogApi.CreateLog(auth, obj)
		fmt.Println(arrayResponse, response, err)
}

/**
 * Get all logs
 * @returns ArrayOfLogsResponse
 */
func GetLogs() {
	arrayResponse, response, err := api.LogApi.ListLogs(auth)
	fmt.Println(arrayResponse, response, err)
}

/**
 * Get all runs
 * @returns ArrayOfRunsResponse
 */
func GetRuns() {
	arrayResponse, response, err := api.RunApi.ListRuns(auth)
	fmt.Println(arrayResponse, response, err)
}
