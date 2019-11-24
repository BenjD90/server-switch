# server-switch

An api to allow some users to turn on a server by calling an URL in HTTP.
Workflow :
- Call `GET /emails/authorized` to get list of authorized emails (set in conf)
- Call `POST /emails/:email` to receive an emailwith a token to turn on the server
- With the token in the email, call `POST /emails/siwtch-on/:token` to turn on the server
