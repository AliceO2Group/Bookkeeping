#include <iostream>
#include <grpc++/grpc++.h>
#include "flp.grpc.pb.h"

using grpc::Channel;
using grpc::ClientContext;
using grpc::Status;

using o2::bookkeeping::FlpService;
using o2::bookkeeping::UpdateCountersRequest;
using o2::bookkeeping::Flp;

class BookkeepingClient {
public:
    explicit BookkeepingClient(const std::shared_ptr<Channel> &channel) : mStub(FlpService::NewStub(channel)) {}

    void updateCounters(
            const std::string &flpName,
            int32_t runNumber,
            int64_t nSubtimeframes,
            int64_t nEquipmentBytes,
            int64_t nRecordingBytes,
            int64_t nFairMQBytes
    ) {
        o2::bookkeeping::Flp updatedFlp;
        ClientContext context;
        UpdateCountersRequest counterUpdateRequest;

        counterUpdateRequest.set_flpname(flpName);
        counterUpdateRequest.set_runnumber(runNumber);
        counterUpdateRequest.set_nsubtimeframes(nSubtimeframes);
        counterUpdateRequest.set_nequipmentbytes(nEquipmentBytes);
        counterUpdateRequest.set_nrecordingbytes(nRecordingBytes);
        counterUpdateRequest.set_nfairmqbytes(nFairMQBytes);

        Status status = this->mStub->UpdateCounters(&context, counterUpdateRequest, &updatedFlp);
        if (status.ok()) {
            std::cout << "FLP counters updated created" << std::endl;
        } else {
            std::cout << status.error_code() << ": " << status.error_message() << std::endl;
        }
    }

private:
    std::unique_ptr<FlpService::Stub> mStub;
};

int main() {
    BookkeepingClient client(grpc::CreateChannel("127.0.0.1:4001", grpc::InsecureChannelCredentials()));

    client.updateCounters("FLP-TPC-1", 1, 100, 100, 100, 100);

    return 0;
}
