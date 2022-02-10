# Bookkeeping C++ API client V0.0.1
[![LICENSE](https://img.shields.io/github/license/rummens1337/bookkeeping-cpprest-client.svg)](https://github.com/rummens1337/bookkeeping-cpprest-client/blob/main/LICENSE)
[![GitHub contributors](https://img.shields.io/github/contributors/rummens1337/bookkeeping-cpprest-client)](https://github.com/rummens1337/bookkeeping-cpprest-client/graphs/contributors)

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


# Usage
This library serves as an C++ API client to the O2 bookkeeping system.
API endpoints are documented in docblocks in BookkeepingInterface.h, or in the documentation directory -> index.html -> Bookkeeping -> BookkeepingApi. 
There's also an example of the usage in `Example.cpp`

### API token
API token is loaded into the Bookkeeping request upon page load, and can be extracted by looking with the chrome inspector -> network -> reload page and fetch token from request. TODO: create fetchToken method.

### Example code
If your api is at `http://localhost:4000/api`:
```console
export BOOKKEEPING_URL=http://localhost:4000/api
export BOOKKEEPING_API_TOKEN=jnk5vh43785ycj4gdvlvm84fg...
./bookkeeping-api-cpp-example 1  # argument is run number to add
```
Note: don't include the "Bearer " part of the token, it's added automatically.

# Generate API client
Generate the API client based on the OpenApi file.
For generating the sourcecode we use an [openapi-generator](https://github.com/OpenAPITools/openapi-generator).

From project root directory run:
```console
openapi-generator-cli generate -g cpp-restsdk -i cpp-api-client/openapi-source.yaml -o cpp-api-client/src/cpprest-client/
```
