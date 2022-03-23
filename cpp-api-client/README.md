# Bookkeeping C++ API client

This library serves as an C++ API client to the Bookkeeping backend.
You can generate Doxygen pages by simply running `cmake .. -DONLYDOC=1` and `make`.

### JWT API token workaround
Token management is not yet in place, therefore you need to manually extract it from HTTP request when you load Bookkeeping UI in your browser.

In Firefox, open menu, "More Tools" > "Web Developer Tools", switch to "Network" tab, filter by "XHR" requests. Click on of the requests and find `token` field in "Headers" tab.

During development, to increase validity of the token beyond server restarts, set `JWT_SECRET` field in `/etc/o2.d/o2-bkp.env` file to any string literal.

### Running example using aliBuild
```shell
aliBuild build BookkeepingApiCpp --defaults o2-dataflow
```

Run `alienv enter ...` and then `bookkeeping-api-cpp-example` executable with following options:
- [`url`]: Bookkeeping API URL, default: `http://localhost:4000/api`
- `token`: JWT auth token (see JWT API token workaround section above)
- [`run`]: Run number to be used, default: `1`

## Developers

### API client generation
Generate the API client based on the OpenApi using [openapi-generator](https://github.com/OpenAPITools/openapi-generator).

From project root directory run:
```console
openapi-generator-cli generate -g cpp-restsdk -i cpp-api-client/openapi-source.yaml -o cpp-api-client/src/cpprest-client/
```
