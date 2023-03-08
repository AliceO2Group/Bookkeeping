# Bookkeeping API module

## Installation

### aliBuild installation

Follow [this](https://alice-doc.github.io/alice-analysis-tutorial/building/) tutorial to install `aliBuild`.

First of all, you need to add a dependency on `bookkeeping-api` in alidist.
Then, install `BookkeepingApi` module in your working directory:

```
aliBuild build bookkeeping-api
alienv load bookkeeping-api/latest
```

##### Development

If you want to make changes to the source code initialise the development package first:

```
aliBuild init bookkeeping-api@master
```

and then load the environment using `alienv` and use `make` to recompile

```
alienv enter bookkeeping-api/latest
cd sw/BUILD/bookkeeping-api-latest/bookkeeping-api
make -j install
```

## Usage

The bookkeeping API is split in two different targets:

- `BookkeepingApi` that has no dependency and provide use-case specific functions
- `BookkeepingProtoApi` that provides direct implementations of the services defined in the proto
  Please note that this target depends on google's protocol buffers in order to be used

### Cmake

In order to use the client in your application you need to link the library with your executables. For example if you
have only one executable you can add:

```cmake
# In any case
find_package(BookkeepingApi)

# Use-case specific services
target_link_libraries(${EXECUTABLE_NAME} PRIVATE AliceO2::BookkeepingApi)

# Or proto services implementation
target_link_libraries(${EXECUTABLE_NAME} PRIVATE AliceO2::BookkeepingProtoApi)

# Or both
target_link_libraries(${EXECUTABLE_NAME} PRIVATE AliceO2::BookkeepingProtoApi AliceO2::BookkeepingApi)
```
### C++ usage

The bookkeeping API's client can be requested from one of the two available factories by providing it the gRPC endpoint's URI:

#### Use-case specific services

```cpp
#include <BookkeepingApi/BkpClientFactory.h>
using namespace o2::bkp::api;

auto client = BkpClientFactory::create("[host][:port]");
```

If you have a local bookkeeping running, the URI should be `127.0.0.1:4001` (note the **absence** of protocol such
as `https://`).


Then the clients provides access to services which group API calls by context, for example `flp`, `run` and so on.

For example to update readout FLP's counters using a local JSON file you can use

```cpp
#include <BookkeepingApi/BkpClientFactory.h>
using namespace o2::bkp::api;

auto client = BkpClientFactory::create("[grpc-endpoint-url]");
client->flp()->updateReadoutCountersByFlpNameAndRunNumber("FLP-NAME", runNumber, nSubtimeframes, nEquipmentBytes, nRecordingBytes, nFairMQBytes);
```

#### Proto services implementations

```cpp
#include <BookkeepingApi/BkpProtoClientFactory.h>
using namespace o2::bkp::api::proto;

auto client = BkpProtoClientFactory::create("[host][:port]");
```

If you have a local bookkeeping running, the URI should be `127.0.0.1:4001` (note the **absence** of protocol such
as `https://`).

Then the clients provides services implementations by the service name. For example, the implementation of the service `RunService` is available through `run()`.

For example to fetch a run and its related fill one can use:

```cpp
#include <BookkeepingApi/BkpProtoClientFactory.h>
using namespace o2::bkp::api::proto;
using namespace o2::bookkeeping;

auto client = BkpProtoClientFactory::create("[grpc-endpoint-url]");

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
```

**Both the client creation and service calls may throw `std::runtime_error` that should be caught**
