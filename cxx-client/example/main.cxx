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
#include <sstream>
#include "BookkeepingApi/BookkeepingClientFactory.h"
#include "InfoLogger/InfoLogger.hxx"

using namespace o2::bookkeeping::api;
using namespace AliceO2::InfoLogger;

int main(int argc, char** argv)
{
  InfoLogger logger;

  if (argc < 2) {
    logger.logError("You need to provide path to the configuration as first argument");
    exit(1);
  }

  try {
    // Let Configuration check for file validity which goes out of this example
    // Configuration file must provide the bookkeeping gRPC endpoint's URL in the key `o2.bookkeeping.grpc-url`
    std::stringstream uriStream;
    uriStream << "json://" << argv[1];
    auto client = BookkeepingClientFactory::fromConfiguration(uriStream.str());
    client->flp()->updateReadoutCountersByFlpNameAndRunNumber("FLP-TPC-1", 1, 2, 2, 2, 2);
    logger.log(InfoLogger::Severity::Info, "FLP counters have been successfully updated");
  } catch (std::runtime_error& error) {
    std::stringstream errorMessageStream;
    errorMessageStream << "An error occurred: " << error.what();
    logger.log(InfoLogger::Severity::Error, "An error occurred: %s", error.what());
    exit(2);
  }

  return 0;
}
