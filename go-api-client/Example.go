package main

import apiClient "./src"
import sw "./src/go-client-generated"

func main() {
    // Set base url and api token
    baseUrl := "http://vm4.jiskefet.io/api"
    apiToken := "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NzQ2NjQwLCJ1c2VybmFtZSI6ImF3ZWdyenluIiwiYWNjZXNzIjoxLCJpYXQiOjE2MTA1NDM0ODYsImV4cCI6MTYxMDYyOTg4NiwiaXNzIjoibzItdWkifQ.8pM1K0HIfpnZop7bJk_rD5GvkfeiWaNNs2S7ZM1tqYg"

	// Initialize api with manual JWT token + baseurl
	// TODO: generate correct JWT token instead of manual insertion
	apiClient.InitializeApi(baseUrl, apiToken)

    // Create a run
	apiClient.CreateRun("cpp-api", 5, 5, 1, 9000, sw.COSMICS_RunType, 12040213, 12040213)

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
