# apirquest

A terminal-based API testing and management tool — like Postman, but for the command line. Save, organize, and run HTTP requests without leaving your shell. All data lives in plain JSON files on your machine; no database, no account, no cloud sync.

## Features

- File-based storage — every request is its own JSON file under `~/.apirquest/`
- Interactive mode (menu-driven) **and** scriptable commands
- Save request/response history, with automatic pruning
- Environments with `{{VAR}}` interpolation (e.g. `{{BASE_URL}}/users`)
- Export requests as `curl`, `fetch`, `axios`, or raw JSON
- Import requests from a JSON file
- Colorized, syntax-highlighted output; loading spinners for network calls
- Works on Windows, macOS, and Linux

## Installation

```bash
npm install -g apirquest
```

Or run it without installing:

```bash
npx apirquest
```

## Quick start

Run with no arguments to open the interactive menu:

```bash
apirquest
```

Or use it non-interactively:

```bash
# Add a request (walks you through prompts)
apirquest add

# List everything you've saved
apirquest list

# View one request
apirquest get <id>

# Run a saved request
apirquest run <id>

# Edit a request
apirquest edit <id>

# Delete a request
apirquest delete <id>

# One-off request, nothing saved
apirquest run-url https://api.example.com/users -m GET -H "Authorization: Bearer TOKEN"

# Export as curl / fetch / axios / json
apirquest export <id> --format curl

# Import a request (or an array of requests) from a file
apirquest import ./my-request.json
```

## Environments

Store variables per environment and reference them in any request field with `{{VAR_NAME}}`:

```bash
apirquest env set dev BASE_URL https://api.dev.example.com
apirquest env set dev TOKEN abc123
apirquest env use dev

apirquest env list
apirquest env show dev
```

Then in a request URL: `{{BASE_URL}}/users/{{USER_ID}}` — resolved automatically at run time against whichever environment is active.

## Where data lives

```
~/.apirquest/
  ├── requests/            # one {id}.json file per saved request
  ├── history/{id}/        # response snapshots per request
  ├── environments/        # one {name}.json file per environment
  └── config.json          # active environment, history limit, timeout
```

Override the location with the `APIRQUEST_HOME` environment variable, or by creating a `.apirquest/` folder in your current project directory (apirquest prefers a local one if it already exists, otherwise falls back to your home directory).

## Configuration

Edit `~/.apirquest/config.json` directly, or let apirquest create it with defaults on first run:

```json
{
  "activeEnvironment": null,
  "historyLimit": 20,
  "timeout": 15000
}
```

## Request JSON format

Used by both `import` and the on-disk storage format:

```json
{
  "id": "4zPHpL4SyQ",
  "title": "Get User Data",
  "url": "https://api.example.com/users/1",
  "method": "GET",
  "headers": [{ "key": "Authorization", "value": "Bearer token" }],
  "query": [{ "key": "limit", "value": "10" }],
  "body": "",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

## Publishing to npm

1. Update `name`, `version`, `author`, and `repository` in `package.json`. Check the name is available: `npm view apirquest` (a 404 means it's free).
2. Log in: `npm login`
3. From the project root: `npm publish`
4. For future updates: bump the version (`npm version patch|minor|major`) and `npm publish` again.

Test the global install locally before publishing:

```bash
npm link
apirquest --help
npm unlink -g apirquest   # when done testing
```

## Requirements

- Node.js 18 or later (uses native `fetch`-adjacent APIs and top-level ES modules; ships with `axios` for HTTP).

## License

MIT
# apirquest
