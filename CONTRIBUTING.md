# Contributing to apirquest

Thank you for your interest in contributing to **apirquest**!

apirquest is an open-source CLI tool for testing and managing APIs directly from the terminal. Contributions, bug reports, feature suggestions, and feedback are welcome.

## Getting Started

### 1. Fork the repository

Fork the repository on GitHub:

https://github.com/MahmadHadi/apirquest

### 2. Clone your fork

```bash
git clone https://github.com/YOUR_USERNAME/apirquest.git
cd apirquest
```

### 3. Install dependencies

```bash
npm install
```

### 4. Run the project locally

You can run the CLI directly with:

```bash
node bin/index.js
```

Or, if you want to use the `apirquest` command during development:

```bash
npm link
```

Then:

```bash
apirquest
```

### 5. Check the version

```bash
apirquest --version
```

## Making Changes

Before making changes, create a new branch:

```bash
git checkout -b feature/your-feature
```

For a bug fix:

```bash
git checkout -b fix/your-fix
```

Make your changes, test them locally, and make sure the existing functionality still works.

## Guidelines

- Keep the code simple and readable.
- Follow the existing project structure and coding style.
- Avoid unnecessary dependencies.
- Do not commit API keys, passwords, tokens, or other secrets.
- Test your changes before creating a pull request.
- Keep commits focused on a single change.
- Update documentation when your changes affect how a feature is used.

## Testing

Before submitting your changes, make sure the CLI works correctly:

```bash
apirquest --help
```

Test the functionality you changed and verify that existing commands still work.

## Pull Request

1. Push your branch:

```bash
git push origin feature/your-feature
```

2. Open a Pull Request against the `main` branch.

3. Clearly describe:
   - What you changed
   - Why you changed it
   - How you tested it

For bug fixes, include steps to reproduce the issue when possible.

## Reporting Bugs

If you find a bug, please open an issue on GitHub:

https://github.com/MahmadHadi/apirquest/issues

Include:

- What you were trying to do
- What you expected to happen
- What actually happened
- Steps to reproduce the issue
- Relevant error messages

## Feature Requests

Have an idea for improving apirquest?

Open a GitHub issue and describe:

- The problem you are trying to solve
- Your proposed solution
- Why you think it would be useful

## Code of Conduct

Please be respectful and constructive when interacting with other contributors.

## License

By contributing to apirquest, you agree that your contributions will be licensed under the same license as the project.
