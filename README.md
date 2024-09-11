# aelf-contract-build

## Description

The `aelf-contract-build` VSCode extension provides a comprehensive suite of tools for building, testing, and deploying aelf smart contracts. This extension allows users to:

- Select a `.csproj` file from their workspace.
- Zip all files within the same folder (including subfolders).
- Upload the zip file via a POST request to a specified server endpoint to build the smart contract.
- Deploy smart contracts directly from the local environment or from a local DLL file.
- Test smart contracts to ensure they function as expected.
- Obtain testnet tokens from a faucet.
- Check the status of transactions.

## Features

- **Build aelf Smart Contracts**: Easily build your aelf smart contracts by selecting a `.csproj` file and uploading it to the server.
- **Test Smart Contracts**: Run tests on your smart contracts to verify their functionality.
- **Deploy Smart Contracts**: Deploy your smart contracts directly from your local environment or from a local DLL file.
- **Faucet Integration**: Get testnet tokens from a faucet to use in your smart contract development.
- **Transaction Status Check**: Check the status of your transactions to ensure they are processed correctly.

## Commands

The extension contributes the following commands:

- `aelf-contract-build.build`: Build aelf smart contract...
- `aelf-contract-build.test`: Test aelf smart contract...
- `aelf-contract-build.deploy`: Deploy aelf smart contract...
- `aelf-contract-build.deployFromLocal`: Deploy aelf smart contract from a local DLL...
- `aelf-contract-build.faucet`: Get testnet tokens from faucet...
- `aelf-contract-build.checkStatus`: Check status of transaction...

## Usage

1. **Build Smart Contract**: Run the `aelf-contract-build.build` command.
2. **Test Smart Contract**: Use the `aelf-contract-build.test` command to run tests on your smart contract.
3. **Deploy Smart Contract**: Deploy your smart contract using the `aelf-contract-build.deploy` or `aelf-contract-build.deployFromLocal` commands.
4. **Get Testnet Tokens**: Use the `aelf-contract-build.faucet` command to get testnet tokens.
5. **Check Transaction Status**: Use the `aelf-contract-build.checkStatus` command to check the status of your most recently deployed contract.

## Installation

To install the extension, follow these steps:

1. Open VSCode.
2. Go to the Extensions view by clicking on the Extensions icon in the Activity Bar on the side of the window.
3. Search for `aelf-contract-build`.
4. Click Install.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
