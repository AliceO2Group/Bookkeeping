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
#include <sstream>
#include "BookkeepingApi/BkpProtoClientFactory.h"
#include "run.pb.h"

using namespace o2::bkp::api::proto;
using namespace o2::bookkeeping;

int main(int argc, char** argv)
{
  if (argc < 2) {
    std::cerr << "You need to provide the gRPC URI as first argument" << std::endl;
    exit(1);
  }

  try {
    auto client = BkpProtoClientFactory::create(argv[1]);

    auto request = std::make_shared<RunFetchRequest>();
    request->set_runnumber(106);
    request->add_relations(RUN_RELATIONS_LHC_FILL);
    std::shared_ptr<RunWithRelations> run106WithRelations = client->run()->Get(request);
    std::ostringstream messageStream;
    messageStream << "Retrieved run 106 info, such as time o2 start <" << run106WithRelations->run().timeo2start() << ">";
    if (run106WithRelations->has_lhcfill()) {
      messageStream << " and related fill info such as fill beam type <" << run106WithRelations->lhcfill().beamtype() << ">";
    }
    std::cout << messageStream.str() << std::endl;
  } catch (std::runtime_error& error) {
    std::cerr << "An error occurred: " << error.what() << std::endl;
    exit(2);
  }
  return 0;
}
