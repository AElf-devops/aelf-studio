import * as vscode from "vscode";
import { AElf } from "./common";
import { RECAPTCHA_SITE_KEY } from "../utilities/googleCaptcha";

function getRecaptchaWebviewContent(siteKey: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>reCAPTCHA</title>
        <script src="https://www.google.com/recaptcha/api.js" async defer onerror="onLoadError()"></script>
      </head>
      <body>
        <h2>Please complete the CAPTCHA to proceed:</h2>
        <div class="g-recaptcha" data-sitekey="${siteKey}" data-callback="onRecaptchaSuccess"></div>
        <script>
          function onRecaptchaSuccess(token) {
           const vscode = acquireVsCodeApi();
           vscode.postMessage({ recaptchaToken: token });
          }
          function onLoadError() {
            const vscode = acquireVsCodeApi();
            vscode.postMessage({ error: "Recaptcha failed to load."});
          }            
        </script>
      </body>
    </html>
  `;
}

async function openRecaptchaWebview(
  context: vscode.ExtensionContext
): Promise<string | undefined> {
  const panel = vscode.window.createWebviewPanel(
    "recaptcha", // Identifies the type of the webview panel
    "Complete reCAPTCHA", // Title of the panel
    vscode.ViewColumn.One, // Editor column to show the new webview panel in
    {
      enableScripts: true, // Allow scripts in the webview
    }
  );
  panel.webview.html = getRecaptchaWebviewContent(RECAPTCHA_SITE_KEY);
  // Return a promise that resolves when the reCAPTCHA token is received
  return new Promise((resolve, reject) => {
    panel.webview.onDidReceiveMessage(
      (message) => {
        if (message.recaptchaToken) {
          resolve(message.recaptchaToken);
          panel.dispose();
        } else if (message.error) {
          // Show a detailed error message
          vscode.window.showErrorMessage(
            `${message.error}\n\nPossible reasons: \n - Network issues (ensure stable internet connection).\n - Google services are blocked in your region (e.g., China).\n`
          );
          reject(new Error(message.error));
          panel.dispose();
        }
      },
      undefined,
      context.subscriptions
    );
  });
}

export const faucet = (context: vscode.ExtensionContext) =>
  vscode.commands.registerCommand("aelf-contract-build.faucet", async () => {
    let privateKey: string = context.globalState.get("privateKey") || "";

    if (!privateKey) {
      // Open the reCAPTCHA webview and get the token
      const captchaToken = await openRecaptchaWebview(context);
      if (!captchaToken) {
        vscode.window.showErrorMessage("CAPTCHA verification failed.");
        return;
      }

      if (!captchaToken) {
        vscode.window.showErrorMessage("CAPTCHA verification failed.");
        return;
      }

      const newWallet = AElf.wallet.createNewWallet();
      privateKey = newWallet.privateKey;
      context.globalState.update("privateKey", privateKey);

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Claiming testnet tokens...",
          cancellable: false,
        },
        async () => {
          const res = await fetch(
            `https://faucet.aelf.dev/api/claim?walletAddress=${newWallet.address}&recaptchaToken=${captchaToken}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Platform: "AelfStudio", // Add the custom header here
              },
            }
          );
          const result = await res.json();
          if (result.isSuccess) {
            vscode.window.showInformationMessage(
              "Testnet tokens claimed successfully."
            );
          } else {
            vscode.window.showInformationMessage(result.message);
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
