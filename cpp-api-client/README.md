# Bookkeeping C++ API client V0.0.1
[![LICENSE](https://img.shields.io/github/license/rummens1337/bookkeeping-cpprest-client.svg)](https://github.com/rummens1337/bookkeeping-cpprest-client/blob/main/LICENSE)
[![GitHub contributors](https://img.shields.io/github/contributors/rummens1337/bookkeeping-cpprest-client)](https://github.com/rummens1337/bookkeeping-cpprest-client/graphs/contributors)


The client currently only supports adding and ending a run. More endpoints will be supported soon.

### runStart
Signature
```cpp
void BookkeepingApi::runStart(int64_t runNumber, boost::posix_time::ptime o2Start,
      boost::posix_time::ptime triggerStart, utility::string_t activityId, 
      RunType runType, int64_t nDetectors, int64_t nFlps, int64_t nEpns) 
```
Description:
Stores start information of a run in the Bookkeeping system

### runStop
Signature
```cpp
void BookkeepingApi::runEnd(int64_t runNumber, boost::posix_time::ptime o2End, boost::posix_time::ptime triggerEnd,
      RunQuality runQuality)
```
Description:
Stores stop information of a run in the Bookkeeping system

### Example
There's also an example of the usage in `src/Example.cpp`


## Manual setup
### Fedora
Install dependencies and build the C++ client.
In the root directory of the client:
```console
dnf install cpprest-devel boost-devel openssl-devel 
mkdir build; cd build
cmake -DCPPREST_ROOT=/usr/include/cpprest ..
```

### Centos 7
Install and build cpprestdk:
```console
git clone git@github.com:microsoft/cpprestsdk.git
cd cpprestsdk
git submodule update --init
mkdir build; cd build
cmake .. -DCMAKE_INSTALL_PREFIX=~/cpprestsdk_install
```

Cmake and make the C++ client.
In the root directory of the client:
```console
cmake . -DCPPREST_LIB=~/cpprestsdk_install -DCPPREST_ROOT=~/cpprestsdk_install
make
```
Alternatively, you can speed up the build by adding the amount of cores it may run on:
```console
make -j $(expr $(nproc) - 1)
```

# Example code
If your api is at `http://myhost.server.address/api`:
```console
export BOOKKEEPING_URL=http://myhost.server.address/api
export BOOKKEEPING_API_TOKEN=jnk5vh43785ycj4gdvlvm84fg...
./bookkeeping-api-cpp-example 1  # argument is run number to add
```
Note: don't include the "Bearer " part of the token, it's added automatically.
