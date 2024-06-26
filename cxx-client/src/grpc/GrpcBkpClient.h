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

#ifndef CXX_CLIENT_GRPC_GRPCBKPCLIENT_H_
#define CXX_CLIENT_GRPC_GRPCBKPCLIENT_H_

#include "flp.grpc.pb.h"
#include "BookkeepingApi/BkpClient.h"

namespace o2::bkp::api::grpc
{
/// gRPC based implementation of BookkeepingClient
class GrpcBkpClient : public o2::bkp::api::BkpClient
{
 public:
  explicit GrpcBkpClient(const std::string& uri);
  ~GrpcBkpClient() override = default;

  const std::unique_ptr<FlpServiceClient>& flp() const override;

  const std::unique_ptr<DplProcessExecutionClient>& dplProcessExecution() const override;

  const std::unique_ptr<QcFlagServiceClient>& qcFlag() const override;

 private:
  std::unique_ptr<::o2::bkp::api::FlpServiceClient> mFlpClient;
  std::unique_ptr<::o2::bkp::api::DplProcessExecutionClient> mDplProcessExecutionClient;
  std::unique_ptr<::o2::bkp::api::QcFlagServiceClient> mQcFlagClient;
};
} // namespace o2::bkp::api::grpc

#endif // CXX_CLIENT_GRPC_GRPCBKPCLIENT_H_
