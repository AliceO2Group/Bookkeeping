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
std::string getEnvString(const std::string& key)
{
    char* env = std::getenv(key.c_str());
    return (env == nullptr) ? std::string("") : std::string(env);
}
}

int main(int argc, char const *argv[])
{
    std::cout << "Hello Bookkeeping-api-cpp!" << std::endl;
	std::string url = getEnvString("BOOKKEEPING_URL");
    std::string apiToken = getEnvString("BOOKKEEPING_API_TOKEN");
    std::cout << "BOOKKEEPING_URL: " << url << '\n'
        << "BOOKKEEPING_API_TOKEN: " << apiToken << std::endl;

    url = url + "?token=" + apiToken;
    std::cout << url << std::endl;
    const int64_t runNumber = boost::lexical_cast<int64_t>(argv[1]);

    auto api = bookkeeping::getApiInstance(url, apiToken);

    
    // Start & end run, with FLPs
    {
        auto now = boost::posix_time::microsec_clock::universal_time();
        std::cout << "Starting run " << runNumber << std::endl;
        api->runStart(runNumber, now, now, "cpp-api", RunType::TECHNICAL, 123, 200, 100);
        
        // std::cout << "Adding FLPs" << std::endl;
        // api->flpAdd(runNumber, "flp-1", "localhost");
        // api->flpAdd(runNumber, "flp-2", "localhost");

        // std::cout << "Updating FLPs" << std::endl;
        // api->flpUpdateCounters(runNumber, "flp-1", 123, 123408, 5834, 9192);
        // api->flpUpdateCounters(runNumber, "flp-2", 13, 318, 23, 952);
        
        // std::cout << "Updating FLPs" << std::endl;
        // api->flpUpdateCounters(runNumber, "flp-1", 234, 323408, 6834, 9292);
        

        std::cout << "Ending run" << std::endl;
        std::this_thread::sleep_for(std::chrono::seconds(1));
        now = boost::posix_time::microsec_clock::universal_time();
        api->runEnd(runNumber, now, now, RunQuality::UNKNOWN);

        // std::cout << "Creating log" << std::endl;
        // std::this_thread::sleep_for(std::chrono::seconds(1));
        // now = boost::posix_time::microsec_clock::universal_time();
        // Bookkeeping::CreateLogParameters parameters = {};
        // parameters.title = "lel";
        // parameters.text = "Some good run guys.. :)";
        // parameters.runIds = {18};
        // api->createLog("Some good run guys..", "LoggyTitle");
    }

    
    // Get run
    // return 0; // Disable for now...
    // {
    //     std::cout << "Getting runs" << std::endl;
    //     Bookkeeping::GetRunsParameters params;
    //     params.pageSize = 3;
    //     params.orderDirection = Bookkeeping::OrderDirection::DESC;
    //     std::vector<Bookkeeping::Run> runs = api->getRuns(params);
    //     for (const auto& run : runs) {
    //         std::cout << "  {\n"
    //         << "    runNumber : " << run.runNumber << '\n'
    //         << "    timeO2Start : " << boost::posix_time::to_iso_extended_string(run.timeO2Start) << '\n'
    //         << "    runType : " << run.runType << '\n'
    //         << "    nFlps : " << run.nFlps << '\n'
    //         << "    bytesReadOut : " << run.bytesReadOut << '\n'
    //         << "  },\n";
    //     }
    // }

    return 0;
}
