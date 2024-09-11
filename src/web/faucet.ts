import * as vscode from "vscode";
import AElf from "aelf-sdk";

const aelf = new AElf(
  new AElf.providers.HttpProvider("https://tdvw-test-node.aelf.io")
);

export const faucet = (context: vscode.ExtensionContext) =>
  vscode.commands.registerCommand("aelf-contract-build.faucet", async () => {
    // The code you place here will be executed every time your command is executed

    let privateKey: string = context.globalState.get("privateKey") || "";

    if (!privateKey) {
      const newWallet = AElf.wallet.createNewWallet();
      privateKey = newWallet.privateKey;
      context.globalState.update("privateKey", privateKey);

      // Show progress of fetch
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Claiming testnet tokens...",
          cancellable: false,
        },
        async (progress) => {
          try {
            let increment = 0;
            const interval = setInterval(() => {
              increment++;
              progress.report({ increment });
            }, 1000);

            // Send the POST request using fetch
            const res = await fetch(
              `https://faucet.aelf.dev/api/claim?walletAddress=${newWallet.address}`,
              { method: "POST" }
            );

            await res.json();
            clearInterval(interval);

            vscode.window.showInformationMessage(
              `Testnet tokens claimed successfully.`
            );
          } catch (error) {
            if (error instanceof Error) {
              vscode.window.showErrorMessage(
                `Token claim error: ${error.message}`
              );
            }
          }
        }
      );
    } else {
      vscode.window
        .showErrorMessage(
          `You have already claimed testnet tokens with this wallet.`,
          "Reset Wallet"
        )
        .then((selection) => {
          if (selection === "Reset Wallet") {
            context.globalState.update("privateKey", "");
            vscode.window.showInformationMessage("Wallet reset.");
          }
        });
    }
  });
