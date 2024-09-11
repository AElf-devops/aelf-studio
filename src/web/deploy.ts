import * as vscode from "vscode";
import AElf from "aelf-sdk";
import { showProgress } from "./progress";

const aelf = new AElf(
  new AElf.providers.HttpProvider("https://tdvw-test-node.aelf.io")
);

export const deploy = (context: vscode.ExtensionContext) =>
  vscode.commands.registerCommand("aelf-contract-build.deploy", async () => {
    // The code you place here will be executed every time your command is executed

    // Find the response from the build command
    const responseContent = context.globalState.get("response");

    if (!responseContent) {
      vscode.window.showInformationMessage("No build response found.");
      return;
    }

    let privateKey: string = context.globalState.get("privateKey") || "";

    if (!privateKey) {
      vscode.window.showErrorMessage("Please claim testnet tokens first.");
      return;
    }

    showProgress(
      "Deploying...",
      async () => {
        const wallet = AElf.wallet.getWalletByPrivateKey(privateKey);
        const chainStatus = await aelf.chain.getChainStatus();
        const genesisContractAddress = chainStatus.GenesisContractAddress;
        // @ts-expect-error
        const genesisContract = await aelf.chain.contractAt(
          genesisContractAddress,
          wallet
        );

        // Send the POST request using fetch
        const response: { TransactionId: string } =
          await genesisContract.DeployUserSmartContract({
            category: 0,
            code: responseContent,
          });

        // Set the transaction ID in global state
        context.globalState.update("transactionId", response.TransactionId);

        let result = await aelf.chain.getTxResult(response.TransactionId);

        let elapsedTime = 0;
        const interval = 5000; // 5 seconds
        const timeout = 60000; // 1 minute

        const checkStatus = async () => {
          if (result.Status === "MINED") {
            // Show message with transactionId and link to aelf Explorer
            vscode.window
              .showInformationMessage(
                `Transaction ID: ${response.TransactionId}`,
                "View on aelf Explorer"
              )
              .then((selection) => {
                if (selection === "View on aelf Explorer") {
                  const transactionId = response.TransactionId;
                  if (transactionId) {
                    const explorerUrl = `https://explorer-test-side02.aelf.io/tx/${transactionId}`;
                    vscode.env.openExternal(vscode.Uri.parse(explorerUrl));
                  } else {
                    vscode.window.showErrorMessage("Transaction ID not found.");
                  }
                }
              });
          } else {
            if (result.Status === "NODEVALIDATIONFAILED") {
              vscode.window.showErrorMessage(
                `Deployment failed: ${result.Error}`
              );
              return;
            }

            if (elapsedTime >= timeout) {
              vscode.window.showErrorMessage(
                "Deployment failed. Timeout reached."
              );
              return;
            }

            await new Promise((resolve) => setTimeout(resolve, interval));
            elapsedTime += interval;

            const updatedResult = await aelf.chain.getTxResult(
              response.TransactionId
            );
            result.Status = updatedResult.Status;

            await checkStatus();
          }
        };

        await checkStatus();
      },
      "Deployment successful."
    );
  });
