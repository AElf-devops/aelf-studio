// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { deploy } from "./deploy";
import { build } from "./build";
import { faucet } from "./faucet";
import { checkStatus } from "./check-status";
import { test } from "./test";
import { deployFromLocal } from "./deploy-from-local";
import { menu } from "./menu";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "aelf-contract-build" is now active in the web extension host!'
  );

  // Add status bar item
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.command = "aelf-contract-build.showMenu";
  statusBarItem.text = "$(rocket) aelf";
  statusBarItem.tooltip = "Show aelf Contract Build Menu";
  statusBarItem.show();

  context.subscriptions.push(statusBarItem);

  const commands = [
    build(context),
    test(context),
    deploy(context),
    deployFromLocal(context),
    faucet(context),
    checkStatus(context),
    menu(context),
  ];

  context.subscriptions.push(...commands);
}

// This method is called when your extension is deactivated
export function deactivate() {}
