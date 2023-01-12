#include "BookkeepingApi/BookkeepingFactory.h"
#include "BookkeepingApi/flp.pb.h"

int main() {
    auto client = BookkeepingFactory::createClient("127.0.0.1:4001");

//    client->updateCounters("FLP-TPC-1", 1, 100, 100, 100, 100);

    o2::bookkeeping::UpdateCountersRequest counterUpdateRequest;

    counterUpdateRequest.set_flpname("FLP-TPC-1");
    counterUpdateRequest.set_runnumber(1);
    counterUpdateRequest.set_nsubtimeframes(2);
    counterUpdateRequest.set_nequipmentbytes(2);
    counterUpdateRequest.set_nrecordingbytes(2);
    counterUpdateRequest.set_nfairmqbytes(2);

    client->updateCountersRequest(counterUpdateRequest);

    return 0;
}
