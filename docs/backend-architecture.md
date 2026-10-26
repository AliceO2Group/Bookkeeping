# Architecture

## Data representation

The project has two different daat representations, `entities` and `models`:

- `Entities` are the "public" representation of data, and they can be used both in the `frontend` and the `backend`.
- `Models` are reserved to the `backend` side, and are mappings in JS of the database modeling of data.

To do the conversion between the `entities` and the `models`, `adapters` are available and provides conversion in both way:

- `toDatabase` to convert from `entities` to `models`
- `toEntity` to convert from `models` to `entities`

## Backend architecture

### Generalities

The backend follow a 3-tier architecture: `controller`, `service` and `model`.

The `controller` is responsible for extracting domain `entities` from the request parameters and body and provide it as API-agnostic parameters to the services. The controllers must ensure that the data passed to services is valid and in the right format. To do so, validators should be used: for simple validation (query parameters and URL parameters) the validation schema can be defined directly in the controller (eventually using `DtoFactory` methods). However, if the request need complex validation, dedicated DTOS must be created (in `lib/dtos`).

The services perform all the domain-related treatment, while delegating all the data access and persistence to the model layer through repositories.

In the current state of the application, the service tier is represented by the `usecases` classes. Currently, those `usecases` are responsible of two things: extract and validate the domain-related informations from the `HTTP` requests and perform the domain-specific treatment. This worked well while the service layer was used only with `HTTP` API, but we now need to implement a `gRPC` API and the requests and responses formatting is not the same, then the services have to be independent of the API.

In the end, the `usecases` needs to be replaced one part by the controllers (parsing the requests and formatting the responses, either for the `HTTP` or the `gRPC` API) and the other part by services to do the treatment itself.

Because the services might have inter-dependencies that can lead to cyclic dependencies, services are divided into two categories:

- Low level services, that are functions responsible of one action. For example `createRun`, `updateLhcFill`. Because those functions are low level and are not expected to be manipulated into controllers, they manipulate exclusively models (Sequelize models). Those functions may depend the one on the others, but **must never** depend on higher level components such as high level services or controllers. They manipulate data through repositories exclusively and must not use Sequelize directly.

- High level services, that group multiple high level actions and that can be used inside the controllers. For example all the CRUD operations that can be done on `runs`. Because those services are used in controllers, their interface is based on entities, but because they may delegate the implementation to lower level services which manipulate models, they may use `adapters` to do the conversion. In this way, the controller simply have to extract entities from request and only have to care about how to parse request/responses. The objective of this layer is to provide high level functionalities that may be used by multiple controllers, such as filter out runs or create log, that often require call to multiple low level services and several `entity <=> models` conversions.

### Error management

Currently, `usecases` returns `HTTP` oriented objects when an exception occurs, with `HTTP` error code and message. This is not viable anymore because those errors makes no sense in `gRPC`. To solve these issues, if an error occur in the service layer, an instance of a specific instance must be thrown and it must be converted to API-specific error in controllers or at an even higher level (for example `AuthenticatedOnly` error will be converted to error code `16` in `gRPC` and `401` in `HTTP`).

### API access log

Every request handled by the `HTTP` API (`/api`, not the static files) and every `gRPC` call is logged once handled, by `ApiRequestLogger` (`HTTP`: `accessLogMiddleware`, `gRPC`: `bindGRPCController`). The entry is a single-line `JSON`, logged by the `API` logger **to the local log only** (it is not forwarded to InfoLogger). `HTTP` and `gRPC` entries share the same structure, so that they can be stored and aggregated together in OpenSearch:

```json
{"type":"api_request","protocol":"http","method":"GET","route":"/api/runs","status":200,"durationMs":42,"userId":7,"bytes":18234,"params":"{\"filter\":{\"runNumbers\":\"1,2\"},\"page\":{\"limit\":\"50\"}}"}
{"type":"api_request","protocol":"grpc","method":null,"route":"/o2.bookkeeping.RunService/Get","status":0,"durationMs":12,"userId":null,"bytes":null,"params":"{\"runNumber\":12}"}
```

- `type`: always `api_request`
- `protocol`: `http` or `grpc`
- `method`: the `HTTP` method, `null` for `gRPC`
- `route`: for `HTTP` the route pattern (for example `/api/runs/:runNumber`) and not the raw url, so that requests can be grouped per endpoint (when no route matched, it is the requested path). For `gRPC` the method path
- `status`: the `HTTP` status or the `gRPC` status code (`0` for success), which are not comparable: filter on `protocol` first
- `durationMs`: time between the reception of the request by the middleware (`HTTP`) or the call (`gRPC`) and the end of the response, so it includes the authentication
- `userId`: the id of the user, `null` if not authenticated
- `bytes`: the `content-length` of the `HTTP` response, `null` if not provided and for `gRPC`
- `params`: the `HTTP` query string (the `token` parameter is removed and the body is never logged) or the `gRPC` request message, as a `JSON` **string** (not an object, because the structure varies from one endpoint to another and the types are not the same between protocols, which would lead to conflicts in OpenSearch mappings). It is omitted when empty and truncated (with a trailing `…`) when it exceeds 1000 characters
- `aborted`: `true` only if the connection was closed before the response was completely sent (`HTTP` only)

Nothing is logged in test mode.
