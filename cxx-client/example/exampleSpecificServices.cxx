//  Copyright 2019-2020 CERN and copyright holders of ALICE O2.
//  See https://alice-o2.web.cern.ch/copyright for details of the copyright holders.
//  All rights not expressly granted are reserved.
//
//  This software is distributed under the terms of the GNU General Public
//  License v3 (GPL Version 3), copied verbatim in the file "COPYING".
//
//  In applying this license CERN does not waive the privileges and immunities
//  granted to it by virtue of its status as an Intergovernmental Organization
//  or submit itself to any jurisdiction.

#include <stdexcept>
#include <iostream>
#include "BookkeepingApi/BkpClientFactory.h"

using namespace o2::bkp::api;

int main(int argc, char** argv)
{
  if (argc < 2) {
    std::cerr << "You need to provide the gRPC URI as first argument and eventually authentication token as second argument" << std::endl;
    exit(1);
  }

  try {
    auto client = argc == 2
      ? BkpClientFactory::create(argv[1])
      : BkpClientFactory::create(argv[1], argv[2]);

    // Test of FLP counters update
    client->flp()->updateReadoutCountersByFlpNameAndRunNumber("FLP-TPC-1", 1, 0xFFFFFFFFFFFFFFFF, 0xFFFFFFFFFFFFFFFF, 0xFFFFFFFFFFFFFFFF, 0xFFFFFFFFFFFFFFFF);
    std::cout << "FLP counters have been successfully updated" << std::endl;

    // Test of DPL process execution
    client->dplProcessExecution()->registerProcessExecution(106, o2::bkp::DplProcessType::QC_CHECKER, "SECOND-HOSTNAME", "PROCESS-NAME", "", "DEFAUlT");
    std::cout << "DPL process execution has been successfully inserted" << std::endl;

    // Test QC flag creation
    auto dataPassQcFlagIds = client->qcFlag()->createForDataPass(
      55,
      "skimming",
      "FT0",
      { { 2, 1565280000000, 1565287200000, "FT0/Check" },
        { .flagTypeId = 11, .origin = "FT0/task" } });

    std::cout << "QC flags has been successfully inserted with ids ";
    for (int flagIndex = 0; flagIndex < dataPassQcFlagIds.size() - 1; flagIndex++) {
      std::cout << dataPassQcFlagIds[flagIndex] << ", ";
    }
    std::cout << dataPassQcFlagIds[dataPassQcFlagIds.size() - 1] << std::endl;

    auto simulationPassQcFlagIds = client->qcFlag()->createForSimulationPass(
      56,
      "LHC23k6b",
      "FT0",
      { { 2, 1565294400000, 1565298000000, "FT0/Check" },
        { .flagTypeId = 11, .origin = "FT0/task" } });

    std::cout << "QC flags has been successfully inserted with ids ";
    for (int flagIndex = 0; flagIndex < simulationPassQcFlagIds.size() - 1; flagIndex++) {
      std::cout << simulationPassQcFlagIds[flagIndex] << ", ";
    }
    std::cout << simulationPassQcFlagIds[simulationPassQcFlagIds.size() - 1] << std::endl;

    // Test trigger counters registration
    client->ctpTriggerCounters()->createOrUpdateForRun(108, "CLASS-NAME", 123, 1, 2, 3, 4, 5, 6);
    std::cout << "Successfully created trigger counters" << std::endl;
    client->ctpTriggerCounters()->createOrUpdateForRun(108, "CLASS-NAME", 1234, 10, 20, 30, 40, 50, 60);
    std::cout << "Successfully updated trigger counters" << std::endl;

    // Test run update
    client->run()->setRawCtpTriggerConfiguration(1, "A\nnew raw\nCTP trigger configuration");
    std::cout << "Successfully updated run raw CTP trigger configuration" << std::endl;
  } catch (std::runtime_error& error) {
    std::cerr << "An error occurred: " << error.what() << std::endl;
    exit(2);
  }

  return 0;
}
