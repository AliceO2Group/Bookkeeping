cmake_minimum_required(VERSION 3.20)

project(BookkeepingApi
    VERSION 0.0.1
    LANGUAGES CXX
)

find_package(Protobuf CONFIG REQUIRED)
find_package(gRPC CONFIG REQUIRED)

set(CMAKE_INSTALL_LIBDIR lib)
set(LIBRARY_OUTPUT_PATH "${CMAKE_BINARY_DIR}/lib")
set(EXECUTABLE_OUTPUT_PATH "${CMAKE_BINARY_DIR}/bin")
set(INCLUDE_OUTPUT_DIRECTORY "${PROJECT_BINARY_DIR}/include")
set(CMAKE_BUILD_TYPE "RelWithDebInfo")

set(PROTO_FILE ${CMAKE_CURRENT_SOURCE_DIR}/../proto/flp.proto)
get_filename_component(PROTO_OUTPUT_NAME ${PROTO_FILE} NAME_WE)
get_filename_component(PROTO_FILE_PREFIX ${PROTO_FILE} PATH)
set(PROTO_CPP_OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/${PROTO_OUTPUT_NAME}.pb.cc)
set(GRPC_CPP_OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/${PROTO_OUTPUT_NAME}.grpc.pb.cc)

add_custom_command(
    OUTPUT "${PROTO_CPP_OUTPUT}"
    COMMAND protobuf::protoc
    ARGS --proto_path ${PROTO_FILE_PREFIX}
         --cpp_out ${CMAKE_CURRENT_BINARY_DIR}
         ${PROTO_OUTPUT_NAME}.proto
    DEPENDS ${PROTO_FILE}
    COMMENT "Running protoc on ${PROTO_FILE}"
    VERBATIM
)

add_custom_command(
    OUTPUT "${GRPC_CPP_OUTPUT}"
    COMMAND protobuf::protoc
    ARGS --proto_path ${PROTO_FILE_PREFIX}
         --grpc_out=${CMAKE_CURRENT_BINARY_DIR}
         --plugin=protoc-gen-grpc=$<TARGET_FILE:gRPC::grpc_cpp_plugin>
         ${PROTO_OUTPUT_NAME}.proto
    DEPENDS ${PROTO_FILE}
    COMMENT "Running protoc/gRPC on ${PROTO_FILE}"
    VERBATIM
)

set(application client.cxx)
get_filename_component(application_name ${application} NAME)
string(REGEX REPLACE ".cxx" "" application_name ${application_name})
add_executable(${application_name} ${application} ${PROTO_CPP_OUTPUT} ${GRPC_CPP_OUTPUT})
target_link_libraries(
    ${application_name} PRIVATE
    gRPC::grpc++
    protobuf::libprotobuf
)
target_include_directories(${application_name} PRIVATE ${CMAKE_CURRENT_BINARY_DIR})
install(TARGETS ${application_name})
