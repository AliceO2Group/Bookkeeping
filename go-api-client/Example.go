package main

import (
	apiClient "github.com/AliceO2Group/Bookkeeping/go-api-client/src"
	sw "github.com/AliceO2Group/Bookkeeping/go-api-client/src/go-client-generated"
	"time"
)

func main() {
	// Set base url and api token
	baseUrl := "http://vm4.jiskefet.io/api"
	apiToken := "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ODUxMzM1LCJ1c2VybmFtZSI6ImRzdGVlbmthIiwiYWNjZXNzIjoxLCJpYXQiOjE2MTcxNzI2ODksImV4cCI6MTY0ODczMDI4OSwiaXNzIjoibzItdWkifQ.JRx7_oNa4SemkcSq176bWM1tsxGhABz37zcYCGQgZnQ"

	// baseUrl := "http://localhost:4000/api"
	// apiToken := "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwidXNlcm5hbWUiOiJBbm9ueW1vdXMiLCJhY2Nlc3MiOjAsImlhdCI6MTYxNzE3MTkwMSwiZXhwIjoxNjQ4NzI5NTAxLCJpc3MiOiJvMi11aSJ9.0XXslyLlFCiBuMveJZkEaPEnnwiXK5RcBzmqOJ77S-w"
	
	// Create an Unix Timestamp to local time.
	testTime := time.Unix(time.Now().Unix(), 0)

	// Initialize api with manual JWT token + baseurl
	// TODO: generate correct JWT token instead of manual insertion
	apiClient.InitializeApi(baseUrl, apiToken)

	// Create a run
	apiClient.CreateRun("go-api-Timestamp", 5, 5, 1, 9020, sw.COSMICS_RunType, testTime, testTime)

	// Update a run
	apiClient.UpdateRun(9020, sw.BAD_RunQuality, testTime, testTime)

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
