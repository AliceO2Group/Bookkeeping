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

## Presentations

| Variable name | Description | Default value |
|---------------|-------------|---------------|
| `ALICE_INSIGHTS_URL` | The HTTP(S) origin of the ALICE Insights generation service, reachable from the Bookkeeping backend. Bookkeeping sends generation requests to `/presentations` on this origin. | Unset |

In Docker Compose, set `ALICE_INSIGHTS_URL` in the `.env` file to an origin the `application` container can reach. For a native Bookkeeping process, set it in that process's environment. The browser uses Bookkeeping's API for both templates and downloads.

Open **Presentations** in the Bookkeeping navigation, choose a reporting period and a template, then select **Generate presentation**. The dates and times of the period are Geneva time, whatever the time zone of the browser. The page offers **Download PDF** when the file is ready. Apply Bookkeeping's template migration and seeders for a local installation with example templates.

The API tests run Bookkeeping against a loopback stand-in for ALICE Insights and check the forwarded request and download. The browser tests use the seeded template list and simulate successful downloads and generation errors.
