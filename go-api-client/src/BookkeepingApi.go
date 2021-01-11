package main

import "context"
import "fmt"
import sw "./go-client-generated"

func createApi(baseUrl string) *sw.APIClient {
	
	cfg := &sw.Configuration{
		BasePath:     baseUrl, // todo: host should be used in combination with basePath (which should be /api) but we haven't gotten it to work properly yet.
		DefaultHeader: make(map[string]string),
		UserAgent:     "Swagger-Codegen/1.0.0/go",
	}

	return sw.NewAPIClient(cfg)
}

func createAuth(apiKey string) context.Context {
	return context.WithValue(context.Background(), sw.ContextAPIKey, sw.APIKey{
		Key: apiKey,
	})
}

func main() {
	api := createApi("http://localhost:4000/api")
	auth := createAuth("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwidXNlcm5hbWUiOiJBbm9ueW1vdXMiLCJhY2Nlc3MiOjAsImlhdCI6MTYxMDM4MTgyMCwiZXhwIjoxNjEwNDY4MjIwLCJpc3MiOiJvMi11aSJ9.F1kV3Xzw-H-YKR_VPuSbIzB-wFwZpFSplT7WwGN0zY8")

	// arrayResponse, response, err := api.RunApi.ListRuns(auth)

	var runtype sw.RunType = sw.PHYSICS_RunType
	run := sw.Run{
		ActivityId : "someId",
		// BytesReadOut : 15,
		// CreatedAt : 12421312,
		NDetectors : 1,
		NEpns : 5,
		NFlps : 5,
		// NSubtimeframes: 10,
		RunNumber : 500111,
		// RunQuality : sw.RunQuality.GOOD_RunQuality,
		RunType : &runtype,
		// TimeO2End : 12421312,
		TimeO2Start : 12421312,
		// TimeTrgEnd : 12421312,
		TimeTrgStart : 12421312,
		// UpdatedAt : 12421312,
	}

	arrayResponse, response, err := api.RunApi.CreateRun(auth, run)
	
	fmt.Println(arrayResponse, response, err)
	fmt.Println("error")
	fmt.Println("Hello World!")
}
