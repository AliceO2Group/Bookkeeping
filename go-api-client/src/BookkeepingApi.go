package main

import "context"
import "fmt"
import sw "./go-client-generated"

var api *sw.APIClient
var auth context.Context

func innitializeApi(baseUrl string, apiKey string) {
	
	cfg := &sw.Configuration{
		BasePath:     baseUrl, // todo: host should be used in combination with basePath (which should be /api) but we haven't gotten it to work properly yet.
		DefaultHeader: make(map[string]string),
		UserAgent:     "Swagger-Codegen/1.0.0/go",
	}

	api = sw.NewAPIClient(cfg)

	auth = context.WithValue(context.Background(), sw.ContextAPIKey, sw.APIKey{
		Key: apiKey,
	})
}

func endRun(runNumber int64, runQuality sw.RunQuality, timeO2End int64, timeTrgEnd int64){
	var runquality sw.RunQuality = runQuality

	run := sw.Run{
		RunQuality : &runquality,
		TimeO2End : timeO2End,
		TimeTrgEnd : timeTrgEnd,
	}

	arrayResponse, response, err := api.RunApi.EndRun(auth, run, runNumber)
	fmt.Println(arrayResponse, response, err)
}

func startRun(activityId string, nDetectors int64, nEpns int64, nFlps int64, runNumber int64, runType sw.RunType, timeO2Start int64, timeTrgStart int64){
	var runtype sw.RunType = runType

	run := sw.Run{
		ActivityId : activityId,
		NDetectors : nDetectors,
		NEpns : nEpns ,
		NFlps : nFlps,
		RunNumber : runNumber,
		RunType : &runtype,
		TimeO2Start : timeO2Start,
		TimeTrgStart : timeTrgStart,
	}

	arrayResponse, response, err := api.RunApi.CreateRun(auth, run)
	fmt.Println(arrayResponse, response, err)
}


func main() {
	innitializeApi("http://localhost:4000/api", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwidXNlcm5hbWUiOiJBbm9ueW1vdXMiLCJhY2Nlc3MiOjAsImlhdCI6MTYxMDM5MDMzMSwiZXhwIjoxNjEwNDc2NzMxLCJpc3MiOiJvMi11aSJ9.bCCaE4FVZnjvFyVCoGFgtq7YER2TzkKLdEdXfJOyRkM")
	startRun("cpp-api", 5, 5, 5, 9000, sw.COSMICS_RunType, 12040213, 12040213)
	endRun(9000, sw.BAD_RunQuality, 12040213, 12040213)
}
