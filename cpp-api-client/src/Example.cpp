#include <string>
#include <iostream>
#include <thread>
#include "BookkeepingFactory.h"
#include "BookkeepingApi.h"
#include "CreateLogParameters.h"
#include <boost/program_options.hpp>

int main(int argc, char const *argv[])
{
  boost::program_options::options_description desc("Allowed options");
  desc.add_options()
    ("url", boost::program_options::value<std::string>()->default_value("http://localhost:4000/api"), "Bookkeeping instance API URL")
    ("token", boost::program_options::value<std::string>()->required(), "JWT token")
    ("run", boost::program_options::value<int64_t>()->default_value(1), "Run number to be created");
  boost::program_options::variables_map vm;
  boost::program_options::store(boost::program_options::parse_command_line(argc, argv, desc), vm);
  boost::program_options::notify(vm);

  const int64_t runNumber = vm["run"].as<int64_t>();
  std::string url = vm["url"].as<std::string>() + "?token=" + vm["token"].as<std::string>();
  std::cout << "Using URL: " << url << " and run number: " << runNumber << std::endl;

  // Instance will be used to make the calls.
  auto api = bookkeeping::getApiInstance(url, vm["token"].as<std::string>());

  // Start a run
  std::time_t now = std::chrono::system_clock::to_time_t(std::chrono::system_clock::now());
  std::cout << "Starting run " << runNumber << " NOW: " << now << std::endl;
  api->runStart(runNumber, now, now, "cpp-api", RunType::TECHNICAL, 123, 200, 100, false, true, false, "normal");

  // Add flp
  std::cout << "Adding FLPs" << std::endl;
  api->flpAdd("flp-1", "localhost");
  api->flpAdd("flp-2", "localhost", runNumber);

  // Update flp. Input the combination of flpname("flp-2") and runNumber(runNumber) of the flp you want to update.
  std::cout << "Updating FLPs" << std::endl;
  api->flpUpdateCounters("flp-2", runNumber, 1, 2, 3, 4);
  std::cout << "Zeroing counters" << std::endl;
  api->flpUpdateCounters("flp-2", runNumber, 0, 0, 0, 0);


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
