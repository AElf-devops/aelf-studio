import * as vscode from "vscode";
import { getLogs, aelf, AELFSCAN_URL } from "./common";

export const checkStatus = (context: vscode.ExtensionContext) =>
  vscode.commands.registerCommand(
    "aelf-contract-build.checkStatus",
    async () => {
      // The code you place here will be executed every time your command is executed
      const transactionId = context.globalState.get("transactionId");

      if (!transactionId) {
        vscode.window
          .showErrorMessage("No transaction ID found.", "Deploy contract")
          .then((selection) => {
            if (selection === "Deploy contract") {
              vscode.commands.executeCommand("aelf-contract-build.deploy");
            }
          });
        return;
      }

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Checking status of transaction...",
          cancellable: false,
        },
        async () => {
          try {
            if (typeof transactionId !== "string") return;

            const result = await aelf.chain.getTxResult(transactionId);

            if (result.Status !== "MINED") {
              vscode.window
                .showInformationMessage(
                  `Transaction status: ${result.Status}`,
                  "View on aelfScan",
                  "Check again"
                )
                .then((selection) => {
                  if (selection === "View on aelfScan") {
                    vscode.env.openExternal(
                      vscode.Uri.parse(
                        `${AELFSCAN_URL}/tx/${transactionId}`
                      )
                    );
                  }
                  if (selection === "Check again") {
                    vscode.commands.executeCommand(
                      "aelf-contract-build.checkStatus"
                    );
                  }
                });
            } else {
              const logs = await getLogs(transactionId);

              const proposalId = logs.proposalId;

              if (!!proposalId) {
                context.globalState.update("proposalId", proposalId);

                vscode.window
                  .showInformationMessage(
                    `Proposal ID: ${proposalId}`,
                    "Check proposal status"
                  )
                  .then((selection) => {
                    if (selection === "Check proposal status") {
                      vscode.commands.executeCommand(
                        "aelf-contract-build.checkProposalStatus"
                      );
                    }
                  });
              }
            }
          } catch (error) {
            const result = error as { Error?: string };

            vscode.window.showErrorMessage(
              `Error checking transaction status: ${result.Error}`
            );
          }
        }
      );
    }
  );
