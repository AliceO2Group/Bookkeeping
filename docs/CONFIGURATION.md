# Configuration
The following configuration items can be set using environment variables, note that Docker users can make use of the `.env` file to store the configuration.

## Database
| Variable name | Description | Default value |
|---------------|-------------|---------------|
| DATABASE_HOST | The host of the relational database. | localhost |
| DATABASE_PORT | The port of the relational database. | 3306 |
| DATABASE_USERNAME | The username which is used to authenticate against the database. | cern |
| DATABASE_PASSWORD | The password which is used to authenticate against the database. | cern |
| DATABASE_NAME | The name of the database | bookkeeping |
| DATABASE_CHARSET | The charset of the relational database. | utf8mb4 |
| DATABASE_COLLATE | The collate of the relational database. | utf8mb4_unicode_ci |
| DATABASE_TIMEZONE | The timezone of the database | Etc/GMT+0 |
| DATABASE_LOGGING | If this variable is true, there is db requests in console | false |

## JSON Web Token (JWT)
| Variable name | Description | Default value |
|---------------|-------------|---------------|
| JWT_SECRET | Secret passphrase to sign and verify tokens. | |
| JWT_EXPIRATION | Token expiration time as time literal. | 1d |
| JWT_ISSUER | Identifies principal that issued the JWT. | o2-ui |
| JWT_MAX_AGE | Token refresh expiration time as time literal. | 7d |

## OpenID
| Variable name | Description | Default value |
|---------------|-------------|---------------|
| OPENID_ID | Application ID | |
| OPENID_SECRET | Application secret | |
| OPENID_REDIRECT | Authentication callback | |
| OPENID_WELL_KNOWN | So-called "well-known" endpoint defining OpenID configuration. | https://auth.cern.ch/auth/realms/cern/.well-known/openid-configuration |
