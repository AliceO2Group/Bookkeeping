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
//
// Created by mboulais on 27/05/24.
//

#ifndef CXX_CLIENT_BOOKKEEPINGAPI_GRPCQCFLAGSERVICECLIENT_H
#define CXX_CLIENT_BOOKKEEPINGAPI_GRPCQCFLAGSERVICECLIENT_H

#include <memory>
#include "qcFlag.grpc.pb.h"
#include "BookkeepingApi/QcFlagServiceClient.h"

namespace o2::bkp::api::grpc::services
{

class GrpcQcFlagServiceClient : public QcFlagServiceClient
{
 public:
  explicit GrpcQcFlagServiceClient(const std::shared_ptr<::grpc::ChannelInterface>& channel);

  std::vector<int> createForDataPass(uint32_t runNumber, const std::string& passName, const std::string& detectorName, const std::vector<QcFlag>& qcFlags) override;
  std::vector<int> createForSimulationPass(uint32_t runNumber, const std::string& productionName, const std::string& detectorName, const std::vector<QcFlag>& qcFlags) override;
  std::vector<int> createForSynchronous(uint32_t runNumber, const std::string& detectorName, const std::vector<QcFlag>& qcFlags) override;

 private:
  /**
   * Apply all the properties of a given o2::bkp::QcFlag to an existing o2::bookkeeping::QcFlag
   *
   * @param qcFlag the model QC flag
   * @param grpcQcFlag the destination QC flag
   */
  static void mirrorQcFlagOnGrpcQcFlag(const QcFlag& qcFlag, bookkeeping::QcFlag* grpcQcFlag);

  std::unique_ptr<o2::bookkeeping::QcFlagService::Stub> mStub;
};

} // namespace o2::bkp::api::grpc::services

#endif // CXX_CLIENT_BOOKKEEPINGAPI_GRPCQCFLAGSERVICECLIENT_H
