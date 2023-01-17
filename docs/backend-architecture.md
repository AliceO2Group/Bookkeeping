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

The `controller` is responsible for extracting domain `entities` from the request parameters and body and provide it as API-agnostic parameters to the services.

The services perform all the domain-related treatment, while delegating all the data access and persistence to the model layer through repositories.

In the current state of the application, the service tier is represented by the `usecases` classes. Currently, those `usecases` are responsible of two things: extract and validate the domain-related informations from the `HTTP` requests and perform the domain-specific treatment. This worked well while the service layer was used only with `HTTP` API, but we now need to implement a `gRPC` API and the requests and responses formatting is not the same, then the services have to be independent of the API.

In the end, the `usecases` needs to be replaced one part by the controllers (parsing the requests and formatting the responses, either for the `HTTP` or the `gRPC` API) and the other part by services to do the treatment itself.

Because the services might have inter-dependencies that can lead to cyclic dependencies, services are divided into two categories: 

- Low level services, that are functions responsible of one action. For example `createRun`, `updateLhcFill`. Because those functions are low level and are not expected to be manipulated into controllers, they manipulate exclusively models (Sequelize models). Those functions may depend the one on the others, but **must never** depend on higher level components such as high level services or controllers. They manipulate data through repositories exclusively and must not use Sequelize directly.

- High level services, that group multiple high level actions and that can be used inside the controllers. For example all the CRUD operations that can be done on `runs`. Because those services are used in controllers, their interface is based on entities, but because they may delegate the implementation to lower level services which manipulate models, they may use `adapters` to do the conversion. In this way, the controller simply have to extract entities from request and only have to care about how to parse request/responses. The objective of this layer is to provide high level functionalities that may be used by multiple controllers, such as filter out runs or create log, that often require call to multiple low level services and several `entity <=> models` conversions.

### Error management

Currently, `usecases` returns `HTTP` oriented objects when an exception occurs, with `HTTP` error code and message. This is not viable anymore because those errors makes no sense in `gRPC`. To solve these issues, if an error occur in the service layer, an instance of a specific instance must be thrown and it must be converted to API-specific error in controllers or at an even higher level (for example `AuthenticatedOnly` error will be converted to error code `16` in `gRPC` and `401` in `HTTP`).
