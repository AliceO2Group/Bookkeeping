# OpenAPI

## Client generation
Reference [OpenAPITools/openapi-generator](https://github.com/OpenAPITools/openapi-generator) on how to generate a C++ (or any other language) client based on an OpenAPI specification. Note that the generated client is of course a best effort and can be incomplete or wrong.

## allOf and additionalProperties
When you use `additionalProperties: false` on an `allOf` schema, it will only consider the schema where the `additionalProperties` property has been set, not the resulting merged schema.

### Specification
```yaml
components:
  schemas:
    Entity:
      type: object
      properties:
        id:
          type: integer
          format: int64
      required:
        - id
    Log:
      allOf:
        - $ref: "#/components/schemas/Model"
        - type: object
          properties:
            title:
              type: string
          required:
            - title
          additionalProperties: false
```

### Response
```json
{
  "id": 1,
  "title": "Log #1"
}
```

### Result
> **Note:** When validating the data, servers and clients will validate the combined model against each model it consists of. It is recommended to avoid using conflicting properties (like properties that have the same names, but different data types).

This implies that behavior is actually correctly. The two schemas are evaluated individually for the whole object, thus the `additionalProperties` will fail because it expects only the required `title` property but actually receives the combined model (thus both `id` and `title`).

### Solution
The `spec/convert.js` will convert `allOf` schema composition to a single schema. For the earlier provided specification the `Log` schema would result in the following:

```yaml
components:
  schemas:
    Entity:
      type: object
      properties:
        id:
          type: integer
          format: int64
      required:
        - id
    Log:
      type: object
      properties:
        id:
          type: integer
          format: int64
        title:
          type: string
      required:
        - id
        - title
      additionalProperties: false
```
