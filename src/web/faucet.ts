import * as vscode from "vscode";
import { AElf } from "./common";

function getRecaptchaWebviewContent(hostedUrl: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>reCAPTCHA</title>
      </head>
      <body>
        <h2>Please complete the CAPTCHA to proceed:</h2>
        <iframe
          src="${hostedUrl}"
          width="100%"
          height="500"
          frameborder="0"
          id="recaptcha-iframe"
        ></iframe>
        <p class="error-message" id="recaptcha-error" style="color:red;display:none;">
          Failed to load CAPTCHA. Please check your network or region restrictions.
        </p>
        <script>
          const vscode = acquireVsCodeApi();

          // Listen for messages from the iframe
          window.addEventListener("message", (event) => {
            if (event.data.recaptchaToken) {
              vscode.postMessage({ recaptchaToken: event.data.recaptchaToken });
            }
          });

          // Handle iframe load errors
          const iframe = document.getElementById("recaptcha-iframe");
          iframe.addEventListener("error", () => {
            document.getElementById("recaptcha-error").style.display = "block";
            vscode.postMessage({
              error: "Failed to load CAPTCHA iframe."
            });
          });
        </script>
      </body>
    </html>
  `;
}

async function openRecaptchaWebview(
  context: vscode.ExtensionContext
): Promise<string | undefined> {
  const hostedRecaptchaUrl = "https://faucet-ui.aelf.dev/captcha.html";
  const panel = vscode.window.createWebviewPanel(
    "recaptcha",
    "Complete reCAPTCHA",
    vscode.ViewColumn.One,
    {
      enableScripts: true, // Allow scripts in the webview
    }
  );

  panel.webview.html = getRecaptchaWebviewContent(hostedRecaptchaUrl);

  return new Promise((resolve,reject) => {
    panel.webview.onDidReceiveMessage(
      (message) => {
        if (message.recaptchaToken) {
          resolve(message.recaptchaToken);
          panel.dispose();
        } else if (message.error) {
          // Show a detailed error message
          vscode.window.showErrorMessage(
            `${message.error}\n\nPossible reasons: \n - Network issues (ensure stable internet connection).\n - Google services are blocked in your region.\n`
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
