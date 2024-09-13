import * as vscode from "vscode";
import { aelf, AElf } from "./common";

export const deploy = (context: vscode.ExtensionContext) =>
  vscode.commands.registerCommand("aelf-contract-build.deploy", async () => {
    // The code you place here will be executed every time your command is executed

    // Find the response from the build command
    const responseContent = context.globalState.get("response");

    if (!responseContent) {
      vscode.window
        .showInformationMessage("No build response found.", "Build")
        .then((selection) => {
          if (selection === "Build") {
            vscode.commands.executeCommand("aelf-contract-build.build");
          }
        });
      return;
    }

    let privateKey: string = context.globalState.get("privateKey") || "";

    if (!privateKey) {
      vscode.window
        .showErrorMessage(
          "Please claim testnet tokens first.",
          "Claim testnet tokens"
        )
        .then((selection) => {
          if (selection === "Claim testnet tokens") {
            vscode.commands.executeCommand("aelf-contract-build.faucet");
          }
        });
    }

    const wallet = AElf.wallet.getWalletByPrivateKey(privateKey);
    const chainStatus = await aelf.chain.getChainStatus();
    const genesisContractAddress = chainStatus.GenesisContractAddress;
    // @ts-expect-error
    const genesisContract = await aelf.chain.contractAt(
      genesisContractAddress,
      wallet
    );

    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Deploying...",
        cancellable: false,
      },
      async () => {
        // Send the POST request using fetch
        const response: { TransactionId: string } =
          await genesisContract.DeployUserSmartContract({
            category: 0,
            code: responseContent,
          });

        try {
          await aelf.chain.getTxResult(response.TransactionId);

          // Set the transaction ID in global state
          context.globalState.update("transactionId", response.TransactionId);

          vscode.window
            .showInformationMessage("Transaction pending.", "Check status")
            .then((selection) => {
              if (selection === "Check status") {
                vscode.commands.executeCommand(
                  "aelf-contract-build.checkStatus"
                );
              }
            });
        } catch (err) {
          let result = err as { Status?: string; Error?: string };

          if (result?.Status === "NODEVALIDATIONFAILED") {
            vscode.window.showErrorMessage(
              `Deployment failed: ${result.Error}`
            );
          }
        }
      }
    );
  });
