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
    std::cerr << "You need to provide the gRPC URI as first argument" << std::endl;
    exit(1);
  }

  try {
    // Test of FLP counters update
    auto client = BkpClientFactory::create(argv[1]);
    client->flp()->updateReadoutCountersByFlpNameAndRunNumber("FLP-TPC-1", 1, 0xFFFFFFFFFFFFFFFF, 0xFFFFFFFFFFFFFFFF, 0xFFFFFFFFFFFFFFFF, 0xFFFFFFFFFFFFFFFF);
    std::cout << "FLP counters have been successfully updated" << std::endl;


    // Test of DPL process execution
    client->dplProcessExecution()->registerProcessExecution(106, o2::bkp::DplProcessType::QC_CHECKER, "SECOND-HOSTNAME", "PROCESS-NAME", "", "DEFAUlT");
  } catch (std::runtime_error& error) {
    std::cerr << "An error occurred: " << error.what() << std::endl;
    exit(2);
  }

  return 0;
}
