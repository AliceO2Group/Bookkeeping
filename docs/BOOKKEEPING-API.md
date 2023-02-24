# Introduction


- [Introduction](#introduction)
  - [HTTP API](#http-api)
    - [Log Entries](#log-entries)
      - [Simple log entry](#simple-log-entry)
      - [Log entry with optional parameters](#log-entry-with-optional-parameters)
  - [gRPC API](#grpc-api)

The ALICE detector is being run in multiple shifts by hundreds of users remotely and in person. To ensure a proper history view and transparency, we make use of Bookkeeping which helps users keep track of the state of the system. It not only allows users to create entries about the state of the system but it is also capable of receiving and analysing notifications from other components when events are triggered. From an operation point of view, it is expected to be amongst the most used applications and it currently offers 2 APIs to communicate: HTTP and gRPC.

## HTTP API

### Log Entries

Bookkeeping allows other services to create log entries with information about the state of the system via the HTTP API and expects information in a JSON format.

A log is composed of:
- `title` - title of the log used to identify the logs in the log-overview page (min 3 and max 140 characters)
- `text` - main content of the log which allows storing Markdown text as well (min 3 characters)
- `[tags]` - list of strings which identify tags used by the respective Bookkeeping instance; If any of the tags cannot be found in the system, the log creation will fail
- `[runNumbers]` - comma separated string with list of numbers with which the log should be associated. If any of the runNumbers cannot be found in the system, the log creation will fail

An HTTP request for storing a log is composed of:
- `host`
- `[port]`
- `path` - `/api/logs`
- request type: `POST`
- `token` - used to identify the sender (it is provided by the Bookkeeping team); Using the token, Bookkeeping will automatically link the log to a certain author;
- `header` - Bookkeeping expects body of the request to be in JSON format, thus header should be set to `'Content-Type: application/json'`
- `data-raw` - body of the request

Given the about structures, one can send information via the HTTP API by using the [cURL](https://curl.se/docs/manpage.html) command as below:

#### Simple log entry
Creating a log entry with only the mandatory fields `title` and `text`
``` 
curl <hostname>:[port]/api/logs?token=<token> \
--request POST \
--header 'Content-Type: application/json' \
--data-raw '{"title": "Log created via cURL command", "text": "Using curl to add a log an entry"}'
```

#### Log entry with optional parameters
Creating a log entry with multiple mandatory and optional parameters
``` 
curl <hostname>:[port]/api/logs?token=<token> \
--request POST \
--header 'Content-Type: application/json' \
--data-raw '{"title": "Log created via cURL command", "text": "Using curl to add a log an entry", "runNumbers": "529476,529475",  "tags": ["ABC"]}'
```

## [gRPC API](grpc.md)