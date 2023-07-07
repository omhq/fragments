# Fragments

Fragments is a platform to compose and manage custom data objects for HTTP transactions. Write simple jinja templates to represent a json or yaml payloads.

- You can integrate different data sources, currently the project supports PostgreSQL and HTTP. 
- Run transformations on the data through custom or built-in functions.
- Cache and serve the results over HTTP.

![Alt text](/screenshots/ui.png?raw=true "UI")

![Alt text](/screenshots/flow.png?raw=true "Flow")

## Development

By default the environment variables defined in dot_env folder are enough for local development.
Bring up the services `make up`.

### Backend

```bash
python -m venv .env
source .env/bin/activate
pip install -r server/requirements.txt
pip install black

make dev_server
```

### Frontend

By default, frontend will point to the server on http://localhost:9001/v1.

```bash
npm install && npm run start
```

### Encrypting connector secrets

By default, the project uses simple symmetric fernet encryption.
You can roll your own encryption strategy depending on your deployment setup.

- `make generate_key`
- Set `ENCRYPT_DATA=True` and `ENCRYPTION_KEY="your-generated-fernet-here"`.
- `make up`
