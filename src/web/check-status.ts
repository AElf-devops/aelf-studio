import * as vscode from "vscode";
import AElf from "aelf-sdk";

const aelf = new AElf(
  new AElf.providers.HttpProvider("https://tdvw-test-node.aelf.io")
);

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
            // @ts-expect-error
            const result = await aelf.chain.getTxResult(transactionId);
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
                      `https://testnet.aelfscan.io/tDVW/tx/${transactionId}`
                    )
                  );
                }
                if (selection === "Check again") {
                  vscode.commands.executeCommand(
                    "aelf-contract-build.checkStatus"
                  );
                }
              });
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
