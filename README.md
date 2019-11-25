# server-switch

An api to allow some users to turn on a server by calling an URL in HTTP.
Workflow :
- Call `GET /emails/authorized` to get list of authorized emails (set in conf)
- Call `POST /emails/:email` to receive an emailwith a token to turn on the server
- With the token in the email, call `POST /emails/siwtch-on/:token` to turn on the server


# Dev
## Env variables :
- PORT
- NODE_ENV
- CONF_PATH

## Build :
- `docker build .`
- run in dev : `docker-compose up`
- build for arm32v7 : `docker build . -t test -f Dockerfile.arm32v7`
