package main

import (
	apiClient "github.com/AliceO2Group/Bookkeeping/go-api-client/src"
	sw "github.com/AliceO2Group/Bookkeeping/go-api-client/src/go-client-generated"
	"time"
)

func main() {
	// Set base url and api token
	baseUrl := "http://localhost:4000/api"
	apiToken := ""<INSERT JWT TOKEN HERE>""
	
	// Create an Unix Timestamp to local time.
	testTime := time.Unix(time.Now().Unix(), 0)

	// Initialize api with manual JWT token + baseurl
	// TODO: generate correct JWT token instead of manual insertion
	apiClient.InitializeApi(baseUrl, apiToken)

	// Create a run
	apiClient.CreateRun("go-api-Timestamp", 5, 5, 1, 23, sw.COSMICS_RunType, testTime, testTime, false, false, true, "normal")

	// Update a run
	apiClient.UpdateRun(23, sw.BAD_RunQuality, testTime, testTime)

	// Create an flp
	apiClient.CreateFlp("flpTestName", "flpTestHost", 23)

	// Update an flp
	apiClient.UpdateFlp("flpTestName", 23, 100, 200, 300, 400)

	// Create a log
	apiClient.CreateLog("logTest", "logTest", "23", -1)

	// // Retrieve all logs from the api
	apiClient.GetLogs()

	// // Retrieve all runs from the api
	apiClient.GetRuns()
}
