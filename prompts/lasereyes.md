# lasereyes

## Introduction

`@kevinoyl/lasereyes` is a modular, framework-agnostic Bitcoin wallet library designed to provide a unified interface across multiple supported wallets for Bitcoin dApps. The library simplifies wallet interactions, making it easier for developers to build Bitcoin-enabled applications regardless of the specific wallet used by the user.

The library is written in TypeScript and is designed for flexibility, making it compatible with various frameworks like React while maintaining a core version that can be used in any JavaScript or TypeScript environment.

### Documentation

- **Website and Documentation**: [https://lasereyes.build](https://lasereyes.build)
- **Getting Started Guide**: [Start here](https://lasereyes.build/getting-started) for step-by-step setup instructions.

## Packages

`@kevinoyl/lasereyes` is split into modular packages to keep it framework-agnostic and flexible:

1. **[lasereyes-core](../packages/core/README.md)**: The main package with wallet implementations and the core logic for handling Bitcoin wallets. This package is not tied to any specific framework.
2. **[lasereyes-react](../packages/react/README.md)**: A React-specific package that builds on `lasereyes-core`, providing React hooks, context providers, and wallet icons to simplify integration into React applications.
3. **[lasereyes](../packages/lasereyes/README.md)**: The main entry point that bundles both `lasereyes-core` and `lasereyes-react`, providing easy access to the functionality of both packages.

## Apps

The `lasereyes` monorepo also includes several apps to demonstrate and document the usage of the library:

1. **[demo.lasereyes.build](../apps/demo.lasereyes.build/README.md)**: A demo application showcasing the features of `@kevinoyl/lasereyes`, including wallet integration and basic dApp functionality.
2. **[react-ui](../apps/react-ui/README.md)**: A Create React App (CRA) that demonstrates how to integrate `@kevinoyl/lasereyes` into a React application using hooks and providers from the `lasereyes-react` package.
3. **[documentation-site](../apps/documentation-site/README.md)**: The documentation site for the `lasereyes` library, built to provide detailed guides, references, and examples for developers.

Each app is configured to work within the monorepo and can be run and developed using the build commands defined in the project.

## Installation

To install the main `@kevinoyl/lasereyes` package, use the following command:

```bash
pnpm add @kevinoyl/lasereyes
```

## Development and Build Process

The `lasereyes` monorepo uses `turbo` for managing build, testing, and development tasks, with `pnpm` as the package manager. Key commands include:

- `pnpm dev`: Starts development mode for all apps and packages.
- `pnpm build`: Builds the entire repository, including all packages.
- `pnpm dev:demo`: Starts development for the demo app.
- `pnpm dev:react`: Starts development for the React UI app.

Testing is done with `vitest`, code formatting is handled with `prettier`, and Git hooks are managed using `husky`.

## Key Features

- **Unified Wallet Interface**: Simplifies Bitcoin wallet integration by offering a common interface for different wallets.
- **Framework-Agnostic Core**: Use `lasereyes-core` in any TypeScript or JavaScript environment.
- **React Support**: `lasereyes-react` includes hooks, context providers, and wallet icons specifically for React developers.

## Next Steps

For more detailed information, including further documentation and API references, visit the [LaserEyes Documentation](https://lasereyes.build).
