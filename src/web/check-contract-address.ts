import * as vscode from "vscode";
import { getLogs, aelf, AELFSCAN_URL } from "./common";

export const checkContractAddress = (context: vscode.ExtensionContext) =>
  vscode.commands.registerCommand(
    "aelf-contract-build.checkContractAddress",
    async () => {
      // The code you place here will be executed every time your command is executed
      const releasedTxId = context.globalState.get("releasedTxId");

      if (!releasedTxId) {
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
            if (typeof releasedTxId !== "string") return;

            const result = await aelf.chain.getTxResult(releasedTxId);

            if (result.Status !== "MINED") {
              vscode.window
                .showInformationMessage(
                  `Transaction status: ${result.Status}`,
                  "Check again"
                )
                .then((selection) => {
                  if (selection === "Check again") {
                    vscode.commands.executeCommand(
                      "aelf-contract-build.checkContractAddress"
                    );
                  }
                });
            } else {
              const logs = await getLogs(releasedTxId);

              const deployedContractAddress = logs.address;

              if (!!deployedContractAddress) {
                context.globalState.update(
                  "deployedContractAddress",
                  deployedContractAddress
                );

                vscode.window
                  .showInformationMessage(
                    `Deployed contract address: ${deployedContractAddress}`,
                    "View on aelf Scan",
                    "Copy"
                  )
                  .then((selection) => {
                    if (selection === "View on aelf Scan") {
                      vscode.env.openExternal(
                        vscode.Uri.parse(
                          `${AELFSCAN_URL}/address/${deployedContractAddress}`
                        )
                      );
                    }
                    if (selection === "Copy") {
                      vscode.env.clipboard.writeText(deployedContractAddress);
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
