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

#ifndef CXX_CLIENT_BOOKKEEPINGAPI_GRPCBKPPROTOCLIENT_H
#define CXX_CLIENT_BOOKKEEPINGAPI_GRPCBKPPROTOCLIENT_H

#include "BookkeepingApi/BkpProtoClient.h"

namespace o2::bkp::api::proto::grpc
{
class GrpcBkpProtoClient : public BkpProtoClient
{
 public:
  explicit GrpcBkpProtoClient(const std::string& uri);
  ~GrpcBkpProtoClient() override = default;

  const std::unique_ptr<RunProtoClient>& run() const override;

  const std::unique_ptr<DplProcessExecutionProtoClient>& dplProcessExecution() const override;

 private:
  std::unique_ptr<::o2::bkp::api::proto::RunProtoClient> mRunClient;
  std::unique_ptr<::o2::bkp::api::proto::DplProcessExecutionProtoClient> mDplProcessExecutionClient;
};
} // namespace o2::bkp::api::proto

#endif // CXX_CLIENT_BOOKKEEPINGAPI_GRPCBKPPROTOCLIENT_H
