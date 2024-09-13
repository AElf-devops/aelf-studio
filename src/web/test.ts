// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { zipSync, strToU8 } from "fflate";
import { PLAYGROUND_URL } from "./common";

export const test = (context: vscode.ExtensionContext) =>
  vscode.commands.registerCommand("aelf-contract-build.test", async () => {
    // The code you place here will be executed every time your command is executed

    const remoteTest = async () => {
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
        vscode.window.showErrorMessage("No .csproj file selected.");
        return;
      }

      const selectedCsprojUri = selectedCsproj.uri;

      // Get the folder of the selected .csproj file
      const csprojFolderUri = vscode.Uri.joinPath(selectedCsprojUri, "..");

      const parentFolderUri = vscode.Uri.joinPath(csprojFolderUri, "..");

      // Find all files in src and test folders
      const fileUris = await vscode.workspace.findFiles(
        new vscode.RelativePattern(parentFolderUri, "**/*.*"),
        "**/node_modules/**" // Exclude node_modules or other unnecessary directories
      );

      if (fileUris.length === 0) {
        vscode.window.showInformationMessage("No files found.");
        return;
      }

      // Check if "src" and "test" folders exist in fileUris
      const srcFolderExists = fileUris.some((uri) =>
        uri.path.includes("/src/")
      );
      const testFolderExists = fileUris.some((uri) =>
        uri.path.includes("/test/")
      );

      if (!srcFolderExists || !testFolderExists) {
        vscode.window.showInformationMessage(
          "Either 'src' or 'test' folder is missing."
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
      const endpoint = `${PLAYGROUND_URL}/playground/test`;

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Running test...",
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
              // Modify the paths in the response and include other text
              const modifiedResponse = responseContent.replace(
                /\/[^\s]*/g,
                (match) => {
                  return match.replace(
                    match,
                    `/${match.split("/").slice(4).join("/")}`
                  );
                }
              );

              // Show the modified test results in the editor
              const testOutput =
                vscode.window.createOutputChannel("Test Results");
              testOutput.append(modifiedResponse);

              testOutput.show();
            } else {
              throw new Error(response.statusText);
            }
          } catch (error) {
            if (error instanceof Error) {
              console.log(error);
              vscode.window.showErrorMessage(
                `Error: There was a problem, please check your code.`
              );
            }
          }
        }
      );
    };

    if (vscode.env.uiKind === vscode.UIKind.Desktop) {
      // Code for desktop environment
      vscode.window
        .showInformationMessage(
          "It seems you are running VSCode Desktop, do you wish to run 'dotnet test' locally instead?",
          "Yes",
          "No"
        )
        .then((response) => {
          if (response === "Yes") {
            vscode.window.showInformationMessage(
              "Please open a terminal and run 'dotnet test' in the project folder."
            );

            return;
          } else {
            remoteTest();
          }
        });
    } else {
      remoteTest();
    }
  });
