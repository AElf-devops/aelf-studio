// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { zipSync, strToU8 } from "fflate";

export const build = (context: vscode.ExtensionContext) =>
  vscode.commands.registerCommand("aelf-contract-build.build", async () => {
    // The code you place here will be executed every time your command is executed

    // Find all .csproj files in the workspace
    const csprojUris = await vscode.workspace.findFiles(
      "**/*.csproj",
      "**/node_modules/**"
    );

    if (csprojUris.length === 0) {
      vscode.window.showInformationMessage(
        "No .csproj files found in the workspace."
      );
      return;
    }

    // Map the URIs to QuickPick items
    const csprojItems = csprojUris.map((uri) => ({
      label: uri.path.split("/").pop() || "", // Get file name from URI path
      description: uri.path, // Show the full path in the description
      uri: uri, // Store the URI for later use
    }));

    // Prompt the user to pick a .csproj file
    const selectedCsproj = await vscode.window.showQuickPick(csprojItems, {
      placeHolder: "Select a .csproj file",
    });

    if (!selectedCsproj) {
      vscode.window.showInformationMessage("No .csproj file selected.");
      return;
    }

    const selectedCsprojUri = selectedCsproj.uri;

    // Get the folder of the selected .csproj file
    const csprojFolderUri = vscode.Uri.joinPath(selectedCsprojUri, "..");

    // Find all files within the same folder as the .csproj file and its subfolders
    const fileUris = await vscode.workspace.findFiles(
      new vscode.RelativePattern(csprojFolderUri, "**/*.*"),
      "**/node_modules/**" // Exclude node_modules or other unnecessary directories
    );

    if (fileUris.length === 0) {
      vscode.window.showInformationMessage(
        "No files found in the folder of the .csproj file."
      );
      return;
    }

    const zipData: { [key: string]: Uint8Array } = {};

    // Loop through all files and get their content, then add them to the zip
    for (const fileUri of fileUris) {
      try {
        const document = await vscode.workspace.openTextDocument(fileUri);
        const content = document.getText();

        // Add the file to the zip structure (using relative file paths)
        const relativePath = vscode.workspace.asRelativePath(fileUri, false); // Get relative path
        zipData[relativePath] = strToU8(content); // Convert string content to Uint8Array for the zip
      } catch (error) {
        console.error(`Error reading file: ${fileUri.path}`, error);
      }
    }

    // Create the zip file using fflate
    const zippedContent = zipSync(zipData);

    // Prepare FormData and append the zip file
    const formData = new FormData();
    const zipBlob = new Blob([zippedContent], { type: "application/zip" });
    formData.append("contractFiles", zipBlob, "files.zip");

    // Define the endpoint where the POST request will be sent
    const endpoint = "https://playground-next.test.aelf.dev/playground/build"; // Replace with your actual endpoint

    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Building...",
        cancellable: false,
      },
      async () => {
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            const responseContent = await response.text();
            context.globalState.update("response", responseContent);

            vscode.window
              .showInformationMessage("Build successful.", "Deploy")
              .then((selection) => {
                if (selection === "Deploy") {
                  vscode.commands.executeCommand("aelf-contract-build.deploy");
                }
              });
          } else {
            throw new Error(response.statusText);
          }
        } catch (error) {
          if (error instanceof Error) {
            vscode.window.showErrorMessage(
              `Error: There was a problem building your contract, please check your code.`
            );
          }
        }
      }
    );
  });
