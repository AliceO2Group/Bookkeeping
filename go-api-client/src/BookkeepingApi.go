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

func updateRun(runNumber int64, runQuality sw.RunQuality, timeO2End int64, timeTrgEnd int64){
	var runquality sw.RunQuality = runQuality

	obj := sw.Run{
		RunQuality : &runquality,
		TimeO2End : timeO2End,
		TimeTrgEnd : timeTrgEnd,
	}

	arrayResponse, response, err := api.RunApi.EndRun(auth, obj, runNumber)
	fmt.Println(arrayResponse, response, err)
}

func createRun(activityId string, nDetectors int64, nEpns int64, nFlps int64, runNumber int64, runType sw.RunType, timeO2Start int64, timeTrgStart int64){
	var runtype sw.RunType = runType

	obj := sw.Run{
		ActivityId : activityId,
		NDetectors : nDetectors,
		NEpns : nEpns ,
		NFlps : nFlps,
		RunNumber : runNumber,
		RunType : &runtype,
		TimeO2Start : timeO2Start,
		TimeTrgStart : timeTrgStart,
	}

	arrayResponse, response, err := api.RunApi.CreateRun(auth, obj)
	fmt.Println(arrayResponse, response, err)
}


func createFlp(name string, hostName string, runNumber int64 ){

	obj := sw.CreateFlp{
		Name : name,
		Hostname : hostName,
		RunNumber : runNumber, 
	}

	arrayResponse, response, err := api.FlpApi.CreateFlp(auth, obj)
	fmt.Println(arrayResponse, response, err)
}

// todo: keep runNumbers as string? or convert to css (comma separated string) in function body?
func createLog(text string, title string, runNumbers string, parentLogId int64){
	
	obj := sw.CreateLog{
		Text : text,
		Title : title,
		RunNumbers : runNumbers,
		ParentLogId : parentLogId, 
	}

	arrayResponse, response, err := api.LogApi.CreateLog(auth, obj)
	fmt.Println(arrayResponse, response, err)
}

func getLogs(){
	arrayResponse, response, err := api.LogApi.ListLogs(auth)
	fmt.Println(arrayResponse, response, err)
}

func getRuns(){
	arrayResponse, response, err := api.RunApi.ListRuns(auth)
	fmt.Println(arrayResponse, response, err)
}


func main() {
	innitializeApi("http://localhost:4000/api", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwidXNlcm5hbWUiOiJBbm9ueW1vdXMiLCJhY2Nlc3MiOjAsImlhdCI6MTYxMDM5MTY4MiwiZXhwIjoxNjEwNDc4MDgyLCJpc3MiOiJvMi11aSJ9.-MMsGmk9d_Ku6CvVj1eImljzdk0whTyQuEblS4TnoAg")
	createRun("cpp-api", 5, 5, 5, 9000, sw.COSMICS_RunType, 12040213, 12040213)
	updateRun(9000, sw.BAD_RunQuality, 12040213, 12040213)
	createFlp("someRandomName", "someRandomhost", 5102)
	createLog("test", "test", "1,5,6", 1)
	getLogs()
	getRuns()
}
