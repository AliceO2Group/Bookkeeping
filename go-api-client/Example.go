package main

import (
	apiClient "github.com/AliceO2Group/Bookkeeping/go-api-client/src"
	sw "github.com/AliceO2Group/Bookkeeping/go-api-client/src/go-client-generated"
)

func main() {
	// Set base url and api token
	baseUrl := "http://localhost:4000/api"
	apiToken := "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwidXNlcm5hbWUiOiJhbm9ueW1vdXMiLCJuYW1lIjoiQW5vbnltb3VzIiwiYWNjZXNzIjowLCJpYXQiOjE2MzM2ODQ3MDcsImV4cCI6MTY2NTI0MjMwNywiaXNzIjoibzItdWkifQ.bWbXX5tSgElHCx9bEeRRjGbd2ISckPpCYSwJnOh8mV0"

	// Create an Unix Timestamp to local time.

	testTime := int64(1656936788677)

	// Initialize api with manual JWT token + baseurl
	// TODO: generate correct JWT token instead of manual insertion
	apiClient.InitializeApi(baseUrl, apiToken)

	// // Create a run
	apiClient.CreateRun("go-api-Timestamp", 5, 5, 1, 80, sw.COSMICS_RunType, false, false, true, "normal",
		(sw.CPV_Detectors + "," + sw.ZDC_Detectors + "," + sw.EMC_Detectors))

	// Update a run
	apiClient.UpdateRun(80, sw.BAD_RunQuality, -1, testTime, -1, testTime, false, false, "Repository Hash", "production/production.desc", "processing", "123123123")

	// Create an flp
	apiClient.CreateFlp("flpTestName", "flpTestHost", 80)

	// Update an flp
	apiClient.UpdateFlp("flpTestName", 80, 100, 200, 300, 400)

	// Create a log
	apiClient.CreateLog("logTest", "logTest", "80", -1)

	// Retrieve all logs from the api
	apiClient.GetLogs()

	// Retrieve all runs from the api
	apiClient.GetRuns()
}
