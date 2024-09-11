// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { deploy } from "./deploy";
import { build } from "./build";
import { faucet } from "./faucet";
import { checkStatus } from "./check-status";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "aelf-contract-build" is now active in the web extension host!'
  );

  const commands = [
    build(context),
    deploy(context),
    faucet(context),
    checkStatus(context),
  ];

  context.subscriptions.push(...commands);
}

// This method is called when your extension is deactivated
export function deactivate() {}
