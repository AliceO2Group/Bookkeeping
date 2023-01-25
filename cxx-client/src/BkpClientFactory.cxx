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
// Created by Barthélémy von Haller on 10.01.23.
//

#include "BookkeepingApi/BkpClientFactory.h"
#include "grpc/GrpcBkpClient.h"
#include "Configuration/ConfigurationFactory.h"

using o2::configuration::ConfigurationFactory;

namespace o2::bkp::api
{
std::shared_ptr<BkpClient> BkpClientFactory::fromConfiguration(const std::string& uri)
{
  auto configuration = ConfigurationFactory::getConfiguration(uri);
  return std::make_shared<grpc::GrpcBkpClient>(configuration->get<std::string>("o2.bkp.grpc-uri"));
}
} // namespace o2::bkp::api
