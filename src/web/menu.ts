import * as vscode from "vscode";
import AElf from "aelf-sdk";

const aelf = new AElf(
  new AElf.providers.HttpProvider("https://tdvw-test-node.aelf.io")
);

export const menu = (_context: vscode.ExtensionContext) =>
  vscode.commands.registerCommand("aelf-contract-build.showMenu", async () => {
    let options: vscode.QuickPickItem[] = [
      {
        label: "$(tools) Build Smart Contract",
        description: "Build aelf smart contract",
      },
      {
        label: "$(beaker) Test Smart Contract",
        description: "Test aelf smart contract",
      },
      {
        label: "$(credit-card) Get Testnet Tokens",
        description: "Get testnet tokens from faucet",
      },
      {
        label: "$(cloud-upload) Deploy Smart Contract",
        description: "Deploy aelf smart contract",
      },
      {
        label: "$(check) Check Transaction Status",
        description: "Check status of transaction",
      },
    ];

    const isDesktop = vscode.env.uiKind === vscode.UIKind.Desktop;
    if (isDesktop) {
      options.push({
        label: "$(file) Deploy from Local",
        description: "Deploy aelf smart contract from local file",
      });
    }

    const selection = await vscode.window.showQuickPick(options, {
      placeHolder: "Select an action",
    });

    if (selection) {
      // Add logic to handle each selection
      switch (selection.label) {
        case "$(tools) Build Smart Contract":
          vscode.commands.executeCommand("aelf-contract-build.build");
          break;
        case "$(beaker) Test Smart Contract":
          vscode.commands.executeCommand("aelf-contract-build.test");
          break;
        case "$(cloud-upload) Deploy Smart Contract":
          vscode.commands.executeCommand("aelf-contract-build.deploy");
          break;
        case "$(credit-card) Get Testnet Tokens":
          vscode.commands.executeCommand("aelf-contract-build.faucet");
          break;
        case "$(check) Check Transaction Status":
          vscode.commands.executeCommand("aelf-contract-build.checkStatus");
          break;
        case "$(file) Deploy from Local":
          vscode.commands.executeCommand("aelf-contract-build.deployFromLocal");
          break;
      }
    }
  });
