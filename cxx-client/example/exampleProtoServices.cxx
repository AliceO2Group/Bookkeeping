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
#include "dplProcessExecution.pb.h"

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

    // First option: direct implementation, using constructed request
    auto request = std::make_shared<RunFetchRequest>();
    request->set_runnumber(106);
    request->add_relations(RUN_RELATIONS_LHC_FILL);
    std::shared_ptr<RunWithRelations> run106WithRelations = client->run()->Get(request);
    std::ostringstream messageStreamRun106;
    messageStreamRun106 << "Retrieved run 106 info, such as time o2 start <" << run106WithRelations->run().timeo2start() << ">";
    if (run106WithRelations->has_lhcfill()) {
      messageStreamRun106 << " and related fill info such as fill beam type <" << run106WithRelations->lhcfill().beamtype() << ">";
    }
    std::cout << messageStreamRun106.str() << std::endl;

    // Second option: use shortcut method
    std::shared_ptr<RunWithRelations> run105WithRelations = client->run()->Get(105, { RUN_RELATIONS_LHC_FILL });
    std::ostringstream messageStreamRun105;
    messageStreamRun105 << "Retrieved run 105 info, such as time o2 start <" << run106WithRelations->run().timeo2start() << ">";
    if (run106WithRelations->has_lhcfill()) {
      messageStreamRun105 << " and related fill info such as fill beam type <" << run106WithRelations->lhcfill().beamtype() << ">";
    }
    std::cout << messageStreamRun105.str() << std::endl;

    // Test of DPL process execution
    auto creationRequest = std::make_shared<DplProcessExecutionCreationRequest>();
    creationRequest->set_runnumber(106);
    creationRequest->set_detectorname("DETECTOR");
    creationRequest->set_processname("PROCESS-NAME");
    creationRequest->set_type(o2::bookkeeping::DPL_PROCESS_TYPE_MERGER);
    creationRequest->set_hostname("HOSTNAME");
    std::shared_ptr<DplProcessExecution> dplProcessExecution = client->dplProcessExecution()->Create(creationRequest);

    // Short version
    client->dplProcessExecution()->registerProcessExecution(106, o2::bookkeeping::DPL_PROCESS_TYPE_QC_CHECKER, "SECOND-HOSTNAME", "PROCESS-NAME", "", "DEFAUlT");
  } catch (std::runtime_error& error) {
    std::cerr << "An error occurred: " << error.what() << std::endl;
    exit(2);
  }
  return 0;
}
