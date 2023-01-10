#include <iostream>
#include "BookkeepingApi/BookkeepingFactory.h"

int main() {
    auto client = BookkeepingFactory::createClient("127.0.0.1:4001");

    client->updateCounters("FLP-TPC-1", 1, 100, 100, 100, 100);

    return 0;
}
