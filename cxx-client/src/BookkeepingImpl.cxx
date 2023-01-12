#include "BookkeepingImpl.h"
#include <iostream>
#include <grpc++/grpc++.h>
#include "BookkeepingApi/flp.grpc.pb.h"

using grpc::Channel;
using grpc::ClientContext;
using grpc::Status;

using o2::bookkeeping::FlpService;
using o2::bookkeeping::UpdateCountersRequest;
using o2::bookkeeping::Flp;

BookkeepingImpl::BookkeepingImpl(const std::string &url) {
    auto channel = grpc::CreateChannel(url, grpc::InsecureChannelCredentials());
    mStub = FlpService::NewStub(channel);
}

void BookkeepingImpl::updateCounters(
        const std::string &flpName,
        int32_t runNumber,
        int64_t nSubtimeframes,
        int64_t nEquipmentBytes,
        int64_t nRecordingBytes,
        int64_t nFairMQBytes
) {
    UpdateCountersRequest counterUpdateRequest;

    counterUpdateRequest.set_flpname(flpName);
    counterUpdateRequest.set_runnumber(runNumber);
    counterUpdateRequest.set_nsubtimeframes(nSubtimeframes);
    counterUpdateRequest.set_nequipmentbytes(nEquipmentBytes);
    counterUpdateRequest.set_nrecordingbytes(nRecordingBytes);
    counterUpdateRequest.set_nfairmqbytes(nFairMQBytes);

    this->updateCountersRequest(counterUpdateRequest);
}

void BookkeepingImpl::updateCountersRequest(const o2::bookkeeping::UpdateCountersRequest &request) {
    o2::bookkeeping::Flp updatedFlp;
    ClientContext context;

    Status status = mStub->UpdateCounters(&context, request, &updatedFlp);
    if (status.ok()) {
        std::cout << "FLP counters updated" << std::endl;
    } else {
        std::cout << status.error_code() << ": " << status.error_message() << std::endl;
    }
}
