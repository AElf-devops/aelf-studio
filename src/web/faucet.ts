import * as vscode from "vscode";
import AElf from "aelf-sdk";
import { showProgress } from "./progress";

export const faucet = (context: vscode.ExtensionContext) =>
  vscode.commands.registerCommand("aelf-contract-build.faucet", async () => {
    // The code you place here will be executed every time your command is executed

    let privateKey: string = context.globalState.get("privateKey") || "";

    if (!privateKey) {
      const newWallet = AElf.wallet.createNewWallet();
      privateKey = newWallet.privateKey;
      context.globalState.update("privateKey", privateKey);

      showProgress("Claiming testnet tokens...", async () => {

        const res = await fetch(
          `https://faucet.aelf.dev/api/claim?walletAddress=${newWallet.address}`,
          { method: "POST" }
        );

        await res.json();

      }, "Testnet tokens claimed successfully.");

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
