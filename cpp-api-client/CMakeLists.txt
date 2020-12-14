cmake_minimum_required(VERSION 3.5.2 FATAL_ERROR)

project(
    BookkeepingApiCpp
    VERSION 0.3.3
    LANGUAGES CXX)

if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release)
endif()

# BUILD TYPE
message("A ${CMAKE_BUILD_TYPE} build configuration is detected")

# Update require components as necessary
find_package(Boost 1.45.0 REQUIRED COMPONENTS thread system regex date_time program_options filesystem)
find_package(cpprestsdk REQUIRED)

set(SOURCE_FILES
    src/cpprest-client/ApiClient.cpp
    src/cpprest-client/ApiConfiguration.cpp
    src/cpprest-client/ApiException.cpp
    src/cpprest-client/HttpContent.cpp
    src/cpprest-client/JsonBody.cpp
    src/cpprest-client/ModelBase.cpp
    src/cpprest-client/MultipartFormData.cpp
    src/cpprest-client/Object.cpp
    src/cpprest-client/api/AttachmentApi.cpp
    src/cpprest-client/api/DefaultApi.cpp
    # src/cpprest-client/api/AuthenticationApi.cpp
    src/cpprest-client/api/FlpApi.cpp
    src/cpprest-client/api/LogApi.cpp
    # src/cpprest-client/api/OverviewApi.cpp
    src/cpprest-client/api/RunApi.cpp
    # src/cpprest-client/api/SettingApi.cpp
    src/cpprest-client/api/SubsystemApi.cpp
    # src/cpprest-client/api/UsersApi.cpp
    src/cpprest-client/api/TagApi.cpp
    # src/cpprest-client/model/CreateAttachmentDto.cpp
    # src/cpprest-client/model/CreateFlpDto.cpp
    # src/cpprest-client/model/CreateLogDto.cpp
    # src/cpprest-client/model/CreateRunDto.cpp
    # src/cpprest-client/model/CreateSubSystemPermissionDto.cpp
    # src/cpprest-client/model/FlpRole.cpp
    # src/cpprest-client/model/LinkLogToRunDto.cpp
    # src/cpprest-client/model/LinkRunToLogDto.cpp
    # src/cpprest-client/model/Log.cpp
    # src/cpprest-client/model/PatchFlpDto.cpp
    # src/cpprest-client/model/PatchRunDto.cpp
    # src/cpprest-client/model/Run.cpp
    # src/cpprest-client/model/SubSystem.cpp
    src/cpprest-client/model/ApiInformation.cpp
    src/cpprest-client/model/ArrayOfAttachmentsResponse.cpp
    src/cpprest-client/model/ArrayOfFlpsResponse.cpp
    src/cpprest-client/model/ArrayOfFlpsResponseMeta.cpp
    src/cpprest-client/model/ArrayOfLogsResponse.cpp
    src/cpprest-client/model/ArrayOfLogsResponseMeta.cpp
    src/cpprest-client/model/ArrayOfRunsResponse.cpp
    src/cpprest-client/model/ArrayOfRunsResponseMeta.cpp
    src/cpprest-client/model/ArrayOfSubsystemsResponse.cpp
    src/cpprest-client/model/ArrayOfSubsystemsResponseMeta.cpp
    src/cpprest-client/model/ArrayOfTagsResponse.cpp
    src/cpprest-client/model/Attachment.cpp
    src/cpprest-client/model/AttachmentResponse.cpp
    src/cpprest-client/model/CreateAttachments.cpp
    src/cpprest-client/model/CreateFlp.cpp
    src/cpprest-client/model/CreateLog.cpp
    src/cpprest-client/model/CreateSubsystem.cpp
    src/cpprest-client/model/CreateTag.cpp
    src/cpprest-client/model/DeployInformation.cpp
    src/cpprest-client/model/Entity.cpp
    src/cpprest-client/model/Error.cpp
    src/cpprest-client/model/Errors.cpp
    src/cpprest-client/model/ErrorSource.cpp
    src/cpprest-client/model/FilterLogsCreatedOptions.cpp
    src/cpprest-client/model/FilterLogsOptions.cpp
    src/cpprest-client/model/FilterLogsTagOptions.cpp
    src/cpprest-client/model/Flp.cpp
    src/cpprest-client/model/FlpResponse.cpp
    src/cpprest-client/model/FlpSortOptions.cpp
    src/cpprest-client/model/Log.cpp
    src/cpprest-client/model/LogOrigin.cpp
    src/cpprest-client/model/LogResponse.cpp
    src/cpprest-client/model/Log_runs.cpp
    src/cpprest-client/model/LogSortOptions.cpp
    src/cpprest-client/model/LogSubtype.cpp
    src/cpprest-client/model/LogTree.cpp
    src/cpprest-client/model/LogTreeResponse.cpp
    src/cpprest-client/model/PaginationMeta.cpp
    src/cpprest-client/model/PaginationOptions.cpp
    src/cpprest-client/model/Run.cpp
    src/cpprest-client/model/RunOrigin.cpp
    src/cpprest-client/model/RunQuality.cpp
    src/cpprest-client/model/RunResponse.cpp
    src/cpprest-client/model/RunSortOptions.cpp
    src/cpprest-client/model/RunType.cpp
    src/cpprest-client/model/SortOrder.cpp
    src/cpprest-client/model/Subsystem.cpp
    src/cpprest-client/model/SubsystemResponse.cpp
    src/cpprest-client/model/Tag.cpp
    src/cpprest-client/model/TagResponse.cpp
    src/cpprest-client/model/User.cpp
    src/cpprest-client/model/UpdateFlp.cpp
    src/BookkeepingApi.cpp
    src/BookkeepingFactory.cpp)

add_library(
    BookkeepingApiCpp
    SHARED
    ${SOURCE_FILES})

target_include_directories(
    BookkeepingApiCpp
    PUBLIC
    $<INSTALL_INTERFACE:include>
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/src/cpprest-client>
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/src/cpprest-client/api>
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/src/cpprest-client/model>)

target_link_libraries(
    BookkeepingApiCpp
    PUBLIC
    cpprestsdk::cpprest
    PRIVATE
    Boost::system
    Boost::date_time
    pthread)

target_compile_features(
    BookkeepingApiCpp
    PUBLIC
    cxx_std_17)

set_target_properties(BookkeepingApiCpp PROPERTIES OUTPUT_NAME "O2BookkeepingApiCpp")

add_executable(
    bookkeeping-api-cpp-example
    src/Example.cpp)

target_link_libraries(
    bookkeeping-api-cpp-example 
    PRIVATE
    Boost::headers
    OpenSSL::SSL # This is temporary workaround as the target should come from cpprestsdk
    BookkeepingApiCpp)


# Set CMAKE_INSTALL_LIBDIR explicitly to lib (to avoid lib64 on CC7)
set(CMAKE_INSTALL_LIBDIR lib)

install(
    TARGETS bookkeeping-api-cpp-example BookkeepingApiCpp
    EXPORT BookkeepingApiCppTargets
    RUNTIME DESTINATION bin
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
    ARCHIVE DESTINATION ${CMAKE_INSTALL_LIBDIR})

install(
    EXPORT BookkeepingApiCppTargets
    FILE BookkeepingApiCppTargets.cmake
    DESTINATION "${CMAKE_INSTALL_LIBDIR}/cmake/BookkeepingApiCpp")

install(
    DIRECTORY src/
    DESTINATION include/BookkeepingApiCpp
    FILES_MATCHING PATTERN "*.h")

# Configure and install package config files
include(CMakePackageConfigHelpers)

write_basic_package_version_file(
    "${CMAKE_CURRENT_BINARY_DIR}/cmake/BookkeepingApiCppConfigVersion.cmake"
    VERSION ${PACKAGE_VERSION}
    COMPATIBILITY AnyNewerVersion)

configure_package_config_file(
    cmake/BookkeepingApiCppConfig.cmake.in 
    cmake/BookkeepingApiCppConfig.cmake
    INSTALL_DESTINATION "${CMAKE_INSTALL_LIBDIR}/cmake/BookkeepingApiCpp"
    PATH_VARS CMAKE_INSTALL_PREFIX)

install(
    FILES
    "${CMAKE_CURRENT_BINARY_DIR}/cmake/BookkeepingApiCppConfig.cmake"
    "${CMAKE_CURRENT_BINARY_DIR}/cmake/BookkeepingApiCppConfigVersion.cmake"
    DESTINATION
    ${CMAKE_INSTALL_LIBDIR}/cmake/BookkeepingApiCpp)
