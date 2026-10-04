# apirquest

A terminal-based API testing and management tool — like Postman, but for the command line. Save, organize, and run HTTP requests without leaving your shell.

All data is stored locally in plain JSON files inside your project. No database, no account, and no cloud sync.

## Features

- **Project-local storage** — store API requests inside your project and share them through Git/GitHub
- File-based storage — every request is stored as a JSON file
- Interactive mode (menu-driven) **and** scriptable commands
- Save request/response history, with automatic pruning
- Environments with `{{VAR}}` interpolation
- Export requests as `curl`, `fetch`, `axios`, or raw JSON
- Import requests from a JSON file
- Colorized and syntax-highlighted output
- Loading spinners for network calls
- Works on Windows, macOS, and Linux
- No database or cloud account required

## Installation

Install globally with npm:

```bash
npm install -g apirquest
```

Or run it without installing:

```bash
npx apirquest
```

## Quick Start

Run with no arguments to open the interactive menu:

```bash
apirquest
```

Or use it non-interactively:

```bash
# Add a request
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

## Storage

apirquest stores saved API requests **inside your project** using a `.apirquest/` directory.

This makes your API collections part of the project and allows you to share them with your team through Git or GitHub.

### Project Storage

When you run apirquest inside a project, it uses the `.apirquest/` directory:

```text
your-project/
├── .apirquest/
│   ├── requests/
│   ├── history/
│   ├── environments/
│   └── config.json
├── src/
└── package.json
```

If the `.apirquest/` directory does not exist, apirquest creates it when required.

Because the API requests are stored inside the project, you can commit the `.apirquest/` directory to Git and share your API collection with other developers.

> **Security:** Do not commit API keys, passwords, access tokens, or other sensitive information to GitHub. Use environment variables or other secure methods for sensitive values.

## Environments

Store variables per environment and reference them in any request field using `{{VAR_NAME}}`:

```bash
apirquest env set dev BASE_URL https://api.dev.example.com
apirquest env set dev TOKEN abc123
apirquest env use dev

apirquest env list
apirquest env show dev
```

Then use variables in requests:

```text
{{BASE_URL}}/users/{{USER_ID}}
```

Variables are resolved automatically at runtime using the active environment.

## Where Data Lives

All apirquest project data is stored inside the `.apirquest/` directory:

```text
.apirquest/
├── requests/             # one {id}.json file per saved request
├── history/{id}/         # response snapshots per request
├── environments/         # one {name}.json file per environment
└── config.json           # active environment, history limit, timeout
```

Since the data is stored inside your project, you can version-control it with Git and share it through GitHub.

## Configuration

Edit the configuration file directly, or let apirquest create it with defaults on first run.

Example:

```json
{
  "activeEnvironment": null,
  "historyLimit": 20,
  "timeout": 15000
}
```

The configuration file is located at:

```text
.apirquest/config.json
```

## Request JSON Format

The following format is used by both `import` and the on-disk request storage:

```json
{
  "id": "4zPHpL4SyQ",
  "title": "Get User Data",
  "url": "https://api.example.com/users/1",
  "method": "GET",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer token"
    }
  ],
  "query": [
    {
      "key": "limit",
      "value": "10"
    }
  ],
  "body": "",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

## Development

Clone the repository:

```bash
git clone https://github.com/MahmadHadi/apirquest.git
cd apirquest
```

Install dependencies:

```bash
npm install
```

Run the project locally:

```bash
node bin/index.js
```

Or link it globally for development:

```bash
npm link
```

Then use:

```bash
apirquest
```

Check the version:

```bash
apirquest --version
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## Contributing

apirquest is an open-source project and contributions are welcome.

You can contribute by:

- Reporting bugs
- Suggesting new features
- Improving documentation
- Fixing issues
- Adding new functionality
- Reviewing or testing pull requests

To contribute, fork the repository, create a branch for your changes, test your changes locally, and open a Pull Request.

For detailed instructions, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Feedback

If you use apirquest, feedback is highly appreciated.

Please report bugs, suggest features, or share your experience through GitHub Issues.

Repository:

https://github.com/MahmadHadi/apirquest

Issues:

https://github.com/MahmadHadi/apirquest/issues

## Publishing to npm

Before publishing, make sure the package information in `package.json` is correct.

Log in to npm:

```bash
npm login
```

Publish the package:

```bash
npm publish
```

For future updates, bump the version and publish again.

For a bug fix:

```bash
npm version patch
npm publish
```

For a new feature:

```bash
npm version minor
npm publish
```

For a breaking change:

```bash
npm version major
npm publish
```

Test the package locally before publishing:

```bash
npm link
apirquest --help
```

When finished testing:

```bash
npm unlink -g apirquest
```

## Requirements

- Node.js 18 or later
- npm

## License

MIT