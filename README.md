# Tuner_AI
## Authentication/Authorization
A rudimentary authentication scheme is implemented. "Login" generates a cookie containing the password.  Subsequent requests to the website
will make a comparison against that cookie password.

Set the `PASSWORD` environment variable and share to any collaborators.
## Server Configuration

The following environment variables are required

* `OPENAI_API_KEY`
* `PASSWORD`

## Server
To run the server locally

```bash
npm run server
```
