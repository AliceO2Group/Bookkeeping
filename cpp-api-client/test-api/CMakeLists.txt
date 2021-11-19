cmake_minimum_required(VERSION 3.5.2 FATAL_ERROR)

project(
    test-api
    VERSION 0.3.3
    LANGUAGES CXX)

#Build instructions:
#install and make the BookKeepingApiCpp library

#Specify the CMakeLists.txt source (input) and build (output)
#For example write in the terminal:  
    # cmake -S test-api -B test-api/build
    #   -(S is the source and where your CMakeLists is located)
    #   -(B is the location where the makefile wil be created.)
#Go to the build folder with the terminal and activate the make 
    # cd test-api/build 
    # make
#Activate the executable
    # ./test-api

find_package(BookkeepingApiCpp)

add_executable(
    ${PROJECT_NAME}
    ./Example.cpp)

target_link_libraries(
    ${PROJECT_NAME} 
    PRIVATE
    OpenSSL::SSL # This is a temporary workaround as the target should come from ccprestsdk
    PUBLIC
    BookkeepingApiCpp
    )

