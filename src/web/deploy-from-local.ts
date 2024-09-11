import * as vscode from "vscode";
import AElf from "aelf-sdk";

const aelf = new AElf(
  new AElf.providers.HttpProvider("https://tdvw-test-node.aelf.io")
);

export const deployFromLocal = (context: vscode.ExtensionContext) =>
  vscode.commands.registerCommand(
    "aelf-contract-build.deployFromLocal",
    async () => {
      // The code you place here will be executed every time your command is executed

      // Find all .dll.patched files in the workspace
      const dllPatchedUris = await vscode.workspace.findFiles(
        "**/*.dll.patched",
        "**/node_modules/**"
      );

      if (dllPatchedUris.length === 0) {
        vscode.window.showInformationMessage(
          "No .dll.patched files found in the workspace."
        );
        return;
      }

      // Map the URIs to QuickPick items
      const dllPatchedItems = dllPatchedUris.map((uri) => ({
        label: uri.path.split("/").pop() || "", // Get file name from URI path
        description: uri.path, // Show the full path in the description
        uri: uri, // Store the URI for later use
      }));

      // Prompt the user to pick a .dll.patched file
      const selectedDllPatched = await vscode.window.showQuickPick(
        dllPatchedItems,
        {
          placeHolder: "Select a .dll.patched file",
        }
      );

      if (!selectedDllPatched) {
        vscode.window.showErrorMessage("No .dll.patched file selected.");
        return;
      }

      // Find the response from the build command
      const selectedDllPatchedContent = await vscode.workspace.fs.readFile(
        selectedDllPatched.uri
      );
      const responseContent = Buffer.from(selectedDllPatchedContent).toString(
        "base64"
      );

      context.globalState.update("response", responseContent);

      await vscode.commands.executeCommand("aelf-contract-build.deploy");
    }
  );
