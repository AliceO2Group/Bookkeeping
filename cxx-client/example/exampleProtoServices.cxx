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
#include "BookkeepingApi/BkpProtoClientFactory.h"
#include "run.pb.h"

using o2::bkp::api::proto::BkpProtoClientFactory;
using o2::bookkeeping::RunFetchRequest;

int main(int argc, char** argv)
{
  if (argc < 2) {
    std::cerr << "You need to provide the gRPC URI as first argument" << std::endl;
    exit(1);
  }

  try {
    auto client = BkpProtoClientFactory::create(argv[1]);

    // First option: direct implementation, using constructed request
    auto request = std::make_shared<RunFetchRequest>();
    request->set_runnumber(106);
    std::shared_ptr<o2::bookkeeping::Run> run106 = client->run()->Get(request);
    std::cout << "Retrieved run 106 info, such as time o2 start" << run106->timeo2start() << std::endl;

    std::shared_ptr<o2::bookkeeping::Run> run105 = client->run()->Get(105);
    std::cout << "Retrieved run 105 info, such as time o2 start" << run105->timeo2start() << std::endl;
  } catch (std::runtime_error& error) {
    std::cerr << "An error occurred: " << error.what() << std::endl;
    exit(2);
  }
  return 0;
}
