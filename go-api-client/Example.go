package main

import (
	apiClient "github.com/AliceO2Group/Bookkeeping/go-api-client/src"
	sw "github.com/AliceO2Group/Bookkeeping/go-api-client/src/go-client-generated"
)

func main() {
	// Set base url and api token
	baseUrl := "http://vm4.jiskefet.io/api"
	apiToken := "<insert jwt token>"

	// Initialize api with manual JWT token + baseurl
	// TODO: generate correct JWT token instead of manual insertion
	apiClient.InitializeApi(baseUrl, apiToken)

	// Create a run
	apiClient.CreateRun("go-api", 5, 5, 1, 9000, sw.COSMICS_RunType, 12040213, 12040213)

	// Update a run
	apiClient.UpdateRun(9000, sw.BAD_RunQuality, 12040213, 12040213)

	// Create an flp
	apiClient.CreateFlp("someRandomName", "someRandomhost", 5102)

	// Update an flp
	apiClient.UpdateFlp(1, "testing-go-client-update", 5, 5, 9000, 9000)

	// Create a log
	apiClient.CreateLog("test", "test", "1", -1)

	// Retrieve all logs from the api
	apiClient.GetLogs()

	// Retrieve all runs from the api
	apiClient.GetRuns()
}
