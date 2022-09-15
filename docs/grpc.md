# gRPC endpoints

## Generalities

gRPC endpoints are grouped into `services` and defined in proto files stored in `proto` directory. The services must be
in the package `o2.bookkeeping`

One service can group multiple endpoints, each of them expecting a specific request message and returning a specific
response message.

## Service implementation

To define the implementation of those services, we use gRPC controllers, that are objects which contains methods with
the same name as the ones defined in the proto. For example, with the given service

```protobuf
message Request {}
message Response {}

service Example {
  rpc MyMethod(Request) returns (Response)
}
```

We need to define a controller object (under any name, but the best is if it correspond to the one in the proto file,
such as `GRPCExampleController`) with AT LEAST one method named `MyMethod`. This method may have an argument, to which
will be provided the `Request` message, and **must** return an object which match `Response` message. The method may
also throw an error, which will be transmitted to the gRPC client (if needed, use pre-defined methods
from `lib/server/errors`, because some specific gRPC error codes may be deduced from the error type).
In order to register which controller handle which gRPC service, the
file `lib/server/gRPC/servicesImplementationsMappings` must be completed. This file exports an object mapping
the `proto` files (property key) to the list of service implementations. Each property value is an array of object
composed of two properties:

- service : a function taking as parameter a proto file definition (extracted
  using [the node loader](https://github.com/grpc/grpc-node)) and returning the corresponding service definition
  extracted from the proto. For example:
  ```js
  (proto) => proto.Example
  ```
- implementation : the object to handle the given service. The object must contain at least one method for all the rpc
  defined in the service. The implementation of a service can not be spread across multiple controllers, but one
  controller can handle multiple services (this is not recommended).

The system will then automate the extraction of the request object, convert enums values to js values (see enums
handling), pass it to the implementation function and return the result to the gRPC client (converting enums the other
way around). The implementation may or may not be asynchronous by returning a Promise.

## Enums handling

Because gRPC enums must have unique values across all the proto files, the gRPC convention to prefix enum values by the
upper snake case of the enum names **must** be applied here.

```protobuf
// Invalid
enum EnumA {
  NULL = 0;
  VALUE_1 = 1;
  VALUE_2 = 2;
}

// Valid
enum EnumB {
  ENUM_B_NULL = 0;
  ENUM_B_VALUE_1 = 1;
  ENUM_B_VALUE_2 = 2;
}
```

In the js code, the prefix will be automatically removed. There are two specific values possible for the
enum : `ENUM_NAME_NULL` which will convert to js `null` value, and `ENUM_NAME_UNDEFINED` which will convert to
js `undefined`. If possible, prefer to use `null` which means a null value than `undefined` which may imply that the
value is not provided, hence undefined (for example when updating an object, undefined may mean that the value must not
be updated, but null means that the value must be unset).

For example, with the following enum:

```protobuf
enum MyEnum {
  MY_ENUM_VAL_NULL = 0;
  MY_ENUM_VAL_A = 1;
  MY_ENUM_VAL_B = 2;
  MY_ENUM_VAL_C = 3;
}
```

If a message contains the value `MY_ENUM_VAL_A` it will be accessible in the controller's implementation as `"VAL_A"`,
and the value `MY_ENUM_VAL_NULL` will be `null`.

If an enum need supplementary processing to convert from/to gRPC enum, this treatment must be defined
in `lib/server/gRPC/services/enumConverter/enumSpecificSupplementaryStep.js`. This file provide a map for which key is
the name of the enum and the value is an object with two properties:

- fromEnum: a function applied after removing the enum name prefix to get the js value
- toEnum: a function applied before adding the enum name prefix to get the enum value

For example, the run quality enum needs lowercase values, we then need to apply `toLowerCase` as `fromEnum` function
and `toUpperCase` as `toEnum`
