# Bookkeeping GO API client V0.0.1

## Go dependencies
```go
go get golang.org/x/oauth2
```

# API endpoints
Class | Method  | Description
------------ | ------------- | ------------- | -------------
*BookkeepingApi.go* | **initializeApi**  | **Initializes the Go client with Url and Token.**  
*BookkeepingApi.go* | **createRun** | Creates a new run
*BookkeepingApi.go* | **updateRun** | Updates an existing run
*BookkeepingApi.go* | **createFlp** | Creates a new flp
*BookkeepingApi.go* | **updateFlp** | Updates an existing flp
*BookkeepingApi.go* | **createLog** | Creates a new log
*BookkeepingApi.go* | **getLogs** | Retrieve last 100 logs
*BookkeepingApi.go* | **getRuns** | Retrieve last 100 runs


# Usage
This library serves as a GO API client to the O2 bookkeeping system. 
API endpoints are documented in the directory ```go-api-client -> src -> 
BookkeepingApi.go```
There's also an example of the usage in `Example.go`

### API token
API token is loaded into the Bookkeeping request upon page load, and can be extracted by looking with the chrome inspector -> network -> reload page and fetch token from request. TODO: create fetchToken method.

### Example code
If your api is at `http://localhost:4000/api`:
```console
export BOOKKEEPING_URL=http://localhost:4000/api
export BOOKKEEPING_API_TOKEN=jnk5vh43785ycj4gdvlvm84fg...
./bookkeeping-api-cpp-example 1  # argument is run number to add
```
Note: don't include the "Bearer " part of the token, it's added automatically.

# Generate API client
Generate the API client based on the OpenApi file in Bookkeeping, which can be found under ```spec -> openapi-source.yaml```.
For generating the Go source code, we use this online tool: https://editor.swagger.io/.
Simply paste the editted OpenApi file in the tool, and generate the Go client. The source code will be downloaded automatically, and can be replaced with the source code in the Bookkeeping project.

Generating source code with the [openapi-generator](https://github.com/OpenAPITools/openapi-generator) CLI tool (as is done with the cpp-api-client), has proven to be insufficient for generating the Go-client. Perhaps this will be fixed somewhere in the future. Added this line as a friendly reminder.
