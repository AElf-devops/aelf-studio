// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { PLAYGROUND_URL } from "./common";

export const auditReport = (context: vscode.ExtensionContext) =>
  vscode.commands.registerCommand("aelf-contract-build.auditReport", async () => {
    // The code you place here will be executed every time your command is executed

    const auditId = context.globalState.get("auditId");

    if (typeof auditId !== "string") {
      vscode.window.showErrorMessage("Perform an audit first.", "Audit Contract").then((selection) => {
        if (selection === "Audit Contract") {
          vscode.commands.executeCommand("aelf-contract-build.audit");
        }
      });

      return;
    }

    // Define the endpoint where the POST request will be sent
    const endpoint = `${PLAYGROUND_URL}/api/playground/report/${auditId}`;

    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Checking...",
        cancellable: false,
      },
      async () => {
        try {
          const response = await fetch(endpoint);

          // display the audit response in output channel
          const outputChannel = vscode.window.createOutputChannel("Audit Report");
          const responseContent = await response.json();
          outputChannel.appendLine(JSON.stringify(responseContent, null, 2));
          outputChannel.show();

        } catch (error) {
          if (error instanceof Error) {
            vscode.window.showErrorMessage(
              `Error: The report is not ready yet.`,
              "Check Again"
            ).then((selection) => {
              if (selection === "Check Again") {
                vscode.commands.executeCommand("aelf-contract-build.auditReport");
              }
            });
          }
        }
      }
    );
  });
