#include <string>
#include <iostream>
#include <thread>
#include "BookkeepingFactory.h"
#include "BookkeepingApi.h"
#include "CreateLogParameters.h"

#include <boost/date_time.hpp>
#include <boost/date_time/posix_time/posix_time.hpp>
#include <boost/date_time/local_time_adjustor.hpp>
#include <boost/lexical_cast.hpp>

namespace
{
    std::string getEnvString(const std::string &key)
    {
        char *env = std::getenv(key.c_str());
        return (env == nullptr) ? std::string("") : std::string(env);
    }
} // namespace

int main(int argc, char const *argv[])
{
    std::cout << "Hello Bookkeeping-api-cpp!" << std::endl;
    // Example string url + api: "http://localhost:4000/api"
    std::string url = "http://localhost:4000/api";
    // Example JWT token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwidXNlcm5hbWUiOiJhbm9ueW1vdXMiLCJuYW1lIjoiQW5vbnltb3VzIiwiYWNjZXNzIjowLCJpYXQiOjE2MjgwMDY3ODMsImV4cCI6MTY1OTU2NDM4MywiaXNzIjoibzItdWkifQ.bJr6CZ2dvEobC5z9VrVPMfXdCQXcYSIYlES1NnyfMXU
    std::string apiToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwidXNlcm5hbWUiOiJhbm9ueW1vdXMiLCJuYW1lIjoiQW5vbnltb3VzIiwiYWNjZXNzIjowLCJpYXQiOjE2MjgwMTEwMjMsImV4cCI6MTY1OTU2ODYyMywiaXNzIjoibzItdWkifQ.p3HcBLJU4z95r2HCoFH9KUqkxe5UxGneQhxA4Y8MoUY";
    std::cout << "BOOKKEEPING_URL: " << url << '\n'
              << "BOOKKEEPING_API_TOKEN: " << apiToken << std::endl;

    url = url + "?token=" + apiToken;
    std::cout << url << std::endl;
    // const int64_t runNumber = boost::lexical_cast<int64_t>(argv[1]);
    const int64_t runNumber = 9003;

    // Create an API instance with url and APItoken.
    // Instance will be used to make the calls.
    auto api = bookkeeping::getApiInstance(url, apiToken);

    // Start a run
    std::time_t now = std::chrono::system_clock::to_time_t(std::chrono::system_clock::now());
    std::cout << "Starting run " << runNumber << " NOW: " << now << std::endl;
    api->runStart(runNumber, now, now, "cpp-api", RunType::TECHNICAL, 123, 200, 100);

    // Add flp
    std::cout << "Adding FLPs" << std::endl;
    api->flpAdd("flp-1", "localhost");
    api->flpAdd("flp-2", "localhost", runNumber);

    // Update flp. Input the combination of flpname("flp-2") and runNumber(runNumber) of the flp you want to update.
    std::cout << "Updating FLPs" << std::endl;
    api->flpUpdateCounters("flp-2", runNumber, 123, 123408, 5834, 9192);


    // End a run
    std::cout << "Ending run" << std::endl;
    std::this_thread::sleep_for(std::chrono::seconds(1));
    now = std::chrono::system_clock::to_time_t(std::chrono::system_clock::now());
    api->runEnd(runNumber, now, now, RunQuality::UNKNOWN);

    // Create a log
    // todo: add attachments to request
    std::cout << "Creating log" << std::endl;
    std::this_thread::sleep_for(std::chrono::seconds(1));
    api->createLog("Porsche 911..", "LoggyTitle", {runNumber}, -1);

    // Get runs
    std::cout << "Getting runs" << std::endl;
    auto runs = api->getRuns();

    for (const auto &run : runs)
    {
        std::cout << run->toJson() << std::endl;
    }
    std::cout << "Amount of runs retrieved: " << runs.size() << std::endl;

    // Get logs
    std::cout << "Getting logs" << std::endl;
    auto logs = api->getLogs();

    for (const auto &log : logs)
    {
        std::cout << log->toJson() << std::endl;
    }
    std::cout << "Amount of logs retrieved: " << logs.size() << std::endl;

    return 0;
}
